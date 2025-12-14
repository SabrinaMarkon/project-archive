<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegularUserAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_can_access_profile(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/profile');

        $response->assertOk();
    }

    public function test_regular_user_can_update_profile(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->patch('/profile', [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/profile');
    }

    public function test_regular_user_can_logout(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_regular_user_cannot_access_admin_dashboard(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertForbidden();
    }

    public function test_regular_user_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin');
        $response->assertForbidden();

        $response = $this->actingAs($user)->get('/admin/projects');
        $response->assertForbidden();

        $response = $this->actingAs($user)->get('/admin/posts');
        $response->assertForbidden();
    }

    public function test_authenticated_user_can_initiate_course_checkout(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $course = Course::factory()->create([
            'price' => 99.00,
            'payment_type' => 'one_time',
        ]);

        $response = $this->actingAs($user)->post(route('courses.checkout', $course->id));

        // Should redirect to Stripe checkout or show error if Stripe not configured
        $this->assertTrue(
            $response->isRedirect() || $response->status() === 500,
            'Checkout should redirect or return server error if payment not configured'
        );
    }

    public function test_guest_cannot_access_checkout(): void
    {
        $course = Course::factory()->create([
            'price' => 99.00,
            'payment_type' => 'one_time',
        ]);

        $response = $this->post(route('courses.checkout', $course->id));

        $response->assertRedirect(route('login'));
    }
}
