<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripePaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_initiate_checkout_for_one_time_course(): void
    {
        // Skip this test as it requires actual Stripe API integration
        // In production, you would either:
        // 1. Use Stripe test mode with real test API keys
        // 2. Mock the entire Stripe service layer
        // 3. Test this integration separately from unit tests
        $this->markTestSkipped('Requires Stripe API mocking or test keys');
    }

    public function test_guest_cannot_initiate_checkout(): void
    {
        $course = Course::factory()->create(['stripe_enabled' => true]);

        $response = $this->post("/courses/{$course->id}/checkout");

        $response->assertRedirect('/login');
    }

    public function test_user_cannot_checkout_if_stripe_disabled(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['stripe_enabled' => false]);

        $response = $this->actingAs($user)
            ->post("/courses/{$course->id}/checkout", [
                'payment_method' => 'stripe',
            ]);

        $response->assertStatus(403);
    }

    public function test_user_cannot_purchase_already_enrolled_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create(['stripe_enabled' => true]);

        // Enroll user
        $user->enrollments()->create([
            'course_id' => $course->id,
            'enrolled_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->post("/courses/{$course->id}/checkout", [
                'payment_method' => 'stripe',
            ]);

        $response->assertStatus(403);
    }

    public function test_successful_payment_creates_purchase_record(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create([
            'price' => '99.99',
            'payment_type' => 'one_time',
        ]);

        // Simulate successful Stripe webhook
        $response = $this->post('/stripe/webhook', [
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'payment_intent' => 'pi_test123',
                    'amount_total' => 9999, // cents
                    'currency' => 'usd',
                    'metadata' => [
                        'user_id' => $user->id,
                        'course_id' => $course->id,
                    ],
                ],
            ],
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('purchases', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'stripe_payment_intent_id' => 'pi_test123',
            'amount' => '99.99',
            'status' => 'completed',
        ]);
    }

    public function test_successful_payment_enrolls_user_in_course(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();

        // Simulate successful payment webhook
        $this->post('/stripe/webhook', [
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'payment_intent' => 'pi_test123',
                    'amount_total' => 9999,
                    'currency' => 'usd',
                    'metadata' => [
                        'user_id' => $user->id,
                        'course_id' => $course->id,
                    ],
                ],
            ],
        ]);

        $this->assertDatabaseHas('course_enrollments', [
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $this->assertTrue($user->fresh()->isEnrolledIn($course));
    }

    public function test_failed_payment_marks_purchase_as_failed(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();

        // Create pending purchase
        $purchase = Purchase::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'stripe_payment_intent_id' => 'pi_test123',
            'amount' => 99.99,
            'currency' => 'usd',
            'status' => 'pending',
            'payment_type' => 'one_time',
        ]);

        // Simulate failed payment webhook
        $this->post('/stripe/webhook', [
            'type' => 'payment_intent.payment_failed',
            'data' => [
                'object' => [
                    'id' => 'pi_test123',
                ],
            ],
        ]);

        $this->assertDatabaseHas('purchases', [
            'id' => $purchase->id,
            'status' => 'failed',
        ]);
    }

    public function test_subscription_payment_creates_recurring_purchase(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create([
            'payment_type' => 'monthly',
            'price' => '29.99',
        ]);

        $this->post('/stripe/webhook', [
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'subscription' => 'sub_test123',
                    'amount_total' => 2999,
                    'currency' => 'usd',
                    'metadata' => [
                        'user_id' => $user->id,
                        'course_id' => $course->id,
                    ],
                ],
            ],
        ]);

        $this->assertDatabaseHas('purchases', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'stripe_subscription_id' => 'sub_test123',
            'payment_type' => 'subscription',
        ]);
    }

    public function test_admin_can_view_all_purchases(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        Purchase::factory()->count(5)->create();

        $response = $this->actingAs($admin)->get('/admin/purchases');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Purchases/Index')
            ->has('purchases', 5)
        );
    }

    public function test_non_admin_cannot_view_purchases(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/purchases');

        $response->assertStatus(403);
    }

    public function test_user_can_view_own_purchases(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();

        Purchase::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($user)->get('/dashboard/purchases');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard/Purchases')
            ->has('purchases', 1)
        );
    }
}
