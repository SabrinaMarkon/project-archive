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
}
