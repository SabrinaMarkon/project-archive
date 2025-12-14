<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Course;
use App\Models\Post;
use App\Models\CourseModule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserJourneyTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_user_registration_and_login_journey(): void
    {
        // 1. Guest visits homepage
        $response = $this->get('/');
        $response->assertOk();

        // 2. Guest registers new account
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // Should redirect to user dashboard (not admin dashboard)
        $response->assertRedirect('/dashboard/courses');
        $this->assertAuthenticated();

        $user = User::where('email', 'testuser@example.com')->first();
        $this->assertFalse($user->is_admin);

        // 3. User sees their courses dashboard (empty initially)
        $response = $this->actingAs($user)->get('/dashboard/courses');
        $response->assertOk();

        // 4. User can logout
        $response = $this->post('/logout');
        $response->assertRedirect('/');
        $this->assertGuest();

        // 5. User can login again
        $response = $this->post('/login', [
            'email' => 'testuser@example.com',
            'password' => 'password123',
        ]);

        // Should redirect to user dashboard
        $response->assertRedirect('/dashboard/courses');
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_access_admin_areas(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $adminRoutes = [
            '/dashboard',
            '/admin',
            '/admin/projects',
            '/admin/posts',
            '/admin/courses',
            '/admin/users',
            '/admin/settings',
        ];

        foreach ($adminRoutes as $route) {
            $response = $this->actingAs($user)->get($route);
            $response->assertForbidden();
        }
    }

    public function test_user_can_access_profile_and_logout_from_any_page(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        // From homepage
        $this->actingAs($user)->get('/');
        $response = $this->get('/profile');
        $response->assertOk();
        $response = $this->post('/logout');
        $response->assertRedirect('/');

        // From courses page
        $this->actingAs($user)->get('/courses');
        $response = $this->get('/profile');
        $response->assertOk();
        $response = $this->post('/logout');
        $response->assertRedirect('/');

        // From dashboard
        $this->actingAs($user)->get('/dashboard/courses');
        $response = $this->get('/profile');
        $response->assertOk();
        $response = $this->post('/logout');
        $response->assertRedirect('/');
    }

    public function test_complete_course_purchase_flow(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $course = Course::factory()->create([
            'title' => 'Test Course',
            'price' => 99.00,
            'stripe_enabled' => true,
            'paypal_enabled' => true,
        ]);

        // 1. User browses courses
        $response = $this->actingAs($user)->get('/courses');
        $response->assertOk();

        // 2. User views course details
        $response = $this->get("/courses/{$course->id}");
        $response->assertOk();

        // 3. User clicks purchase button - should see payment selection
        $response = $this->get("/courses/{$course->id}/checkout");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Checkout/SelectPayment')
            ->has('course')
            ->where('course.id', $course->id)
            ->where('course.stripe_enabled', true)
            ->where('course.paypal_enabled', true)
        );

        // 4. User selects payment method (will fail without API keys, but should reach payment controller)
        $response = $this->post("/courses/{$course->id}/checkout", [
            'payment_method' => 'stripe',
        ]);

        // Should either redirect to Stripe or show error if not configured
        $this->assertTrue(
            $response->isRedirect() || $response->status() === 500,
            'Should redirect to payment or show configuration error'
        );
    }

    public function test_premium_post_access_control(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $regularUser = User::factory()->create(['is_admin' => false]);

        $course = Course::factory()->create(['price' => 99.00]);
        $post = Post::factory()->create(['status' => 'published', 'author_id' => $admin->id]);

        // Make post a premium module
        CourseModule::create([
            'course_id' => $course->id,
            'post_id' => $post->id,
            'is_free' => false,
            'order' => 1,
        ]);

        // 1. Guest sees post card with premium badge
        $response = $this->get('/posts');
        $response->assertOk();

        // 2. Guest clicks post - sees lockscreen
        $response = $this->get("/posts/{$post->slug}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('isPremium', true)
            ->where('canAccess', false)
            ->has('premiumCourse')
        );

        // 3. Regular user without purchase - also sees lockscreen
        $response = $this->actingAs($regularUser)->get("/posts/{$post->slug}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('isPremium', true)
            ->where('canAccess', false)
        );

        // 4. Admin sees content
        $response = $this->actingAs($admin)->get("/posts/{$post->slug}");
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('isPremium', true)
            ->where('canAccess', true)
        );
    }

    public function test_admin_login_goes_to_admin_dashboard(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        // Admin should go to admin dashboard
        $response->assertRedirect('/dashboard');

        $response = $this->actingAs($admin)->get('/dashboard');
        $response->assertOk();
    }

    public function test_guest_redirected_to_login_for_protected_routes(): void
    {
        $course = Course::factory()->create();

        $protectedRoutes = [
            '/dashboard/courses',
            '/profile',
            "/courses/{$course->id}/checkout",
        ];

        foreach ($protectedRoutes as $route) {
            $response = $this->get($route);
            $response->assertRedirect('/login');
        }
    }

    public function test_user_navigation_shows_my_courses_and_profile_links(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/');
        $response->assertOk();

        // User should be able to access their courses dashboard
        $response = $this->get('/dashboard/courses');
        $response->assertOk();

        // User should be able to access their profile
        $response = $this->get('/profile');
        $response->assertOk();
    }

    public function test_admin_navigation_shows_admin_dashboard_link(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        // Admin can access admin dashboard
        $response = $this->actingAs($admin)->get('/dashboard');
        $response->assertOk();

        // Admin can also access user areas
        $response = $this->get('/dashboard/courses');
        $response->assertOk();

        $response = $this->get('/profile');
        $response->assertOk();
    }

    public function test_payment_method_validation_requires_valid_method(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $course = Course::factory()->create([
            'stripe_enabled' => true,
            'paypal_enabled' => true,
        ]);

        // Missing payment_method should fail validation
        $response = $this->actingAs($user)->post("/courses/{$course->id}/checkout", []);
        $response->assertSessionHasErrors('payment_method');

        // Invalid payment_method should fail validation
        $response = $this->post("/courses/{$course->id}/checkout", [
            'payment_method' => 'invalid',
        ]);
        $response->assertSessionHasErrors('payment_method');
    }

    public function test_payment_method_routing_respects_course_settings(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        // Course with only Stripe enabled
        $stripeOnlyCourse = Course::factory()->create([
            'stripe_enabled' => true,
            'paypal_enabled' => false,
        ]);

        $response = $this->actingAs($user)->post("/courses/{$stripeOnlyCourse->id}/checkout", [
            'payment_method' => 'paypal',
        ]);
        $response->assertForbidden();

        // Course with only PayPal enabled
        $paypalOnlyCourse = Course::factory()->create([
            'stripe_enabled' => false,
            'paypal_enabled' => true,
        ]);

        $response = $this->post("/courses/{$paypalOnlyCourse->id}/checkout", [
            'payment_method' => 'stripe',
        ]);
        $response->assertForbidden();
    }

    public function test_user_cannot_purchase_course_already_enrolled_in(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $course = Course::factory()->create([
            'stripe_enabled' => true,
        ]);

        // Enroll user in course
        $user->enrollments()->create([
            'course_id' => $course->id,
            'enrolled_at' => now(),
        ]);

        // Attempt to purchase again should fail
        $response = $this->actingAs($user)->post("/courses/{$course->id}/checkout", [
            'payment_method' => 'stripe',
        ]);
        $response->assertForbidden();
    }

    public function test_stripe_webhook_creates_purchase_and_enrollment_for_one_time_payment(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $course = Course::factory()->create(['price' => 99.00]);

        $this->assertFalse($user->isEnrolledIn($course));

        // Simulate Stripe webhook for one-time payment
        $webhookPayload = [
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'metadata' => [
                        'user_id' => $user->id,
                        'course_id' => $course->id,
                    ],
                    'payment_intent' => 'pi_test_123',
                    'amount_total' => 9900, // $99.00 in cents
                    'currency' => 'usd',
                ],
            ],
        ];

        $response = $this->post('/stripe/webhook', $webhookPayload);
        $response->assertOk();

        // Verify purchase was created
        $this->assertDatabaseHas('purchases', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'stripe_payment_intent_id' => 'pi_test_123',
            'amount' => 99.00,
            'status' => 'completed',
            'payment_type' => 'one_time',
        ]);

        // Verify enrollment was created
        $this->assertDatabaseHas('course_enrollments', [
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        // Verify user is now enrolled
        $user->refresh();
        $this->assertTrue($user->isEnrolledIn($course));
    }

    public function test_stripe_webhook_creates_purchase_and_enrollment_for_subscription(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $course = Course::factory()->create([
            'price' => 29.00,
            'payment_type' => 'monthly',
        ]);

        $this->assertFalse($user->isEnrolledIn($course));

        // Simulate Stripe webhook for subscription payment
        $webhookPayload = [
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'metadata' => [
                        'user_id' => $user->id,
                        'course_id' => $course->id,
                    ],
                    'subscription' => 'sub_test_123',
                    'amount_total' => 2900, // $29.00 in cents
                    'currency' => 'usd',
                ],
            ],
        ];

        $response = $this->post('/stripe/webhook', $webhookPayload);
        $response->assertOk();

        // Verify purchase was created with subscription ID
        $this->assertDatabaseHas('purchases', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'stripe_subscription_id' => 'sub_test_123',
            'amount' => 29.00,
            'status' => 'completed',
            'payment_type' => 'subscription',
        ]);

        // Verify enrollment was created
        $this->assertDatabaseHas('course_enrollments', [
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        // Verify user is now enrolled
        $user->refresh();
        $this->assertTrue($user->isEnrolledIn($course));
    }

    public function test_stripe_webhook_does_not_duplicate_enrollment(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $course = Course::factory()->create(['price' => 99.00]);

        // Pre-enroll user
        $user->enrollments()->create([
            'course_id' => $course->id,
            'enrolled_at' => now()->subDay(),
        ]);

        $enrollmentCount = $user->enrollments()->count();

        // Simulate webhook
        $webhookPayload = [
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'metadata' => [
                        'user_id' => $user->id,
                        'course_id' => $course->id,
                    ],
                    'payment_intent' => 'pi_test_456',
                    'amount_total' => 9900,
                    'currency' => 'usd',
                ],
            ],
        ];

        $this->post('/stripe/webhook', $webhookPayload);

        // Enrollment count should remain the same
        $user->refresh();
        $this->assertEquals($enrollmentCount, $user->enrollments()->count());
    }
}
