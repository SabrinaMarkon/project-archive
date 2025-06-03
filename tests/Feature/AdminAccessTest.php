<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guests cannot access the admin area.
     */
    public function test_guest_cannot_access_the_admin_area(): void
    {
        $response = $this->get('/admin');
        $response->assertRedirect('/login'); // Breeze default for unauthenticated
    }

    /**
     * Test that non admin users (is_admin = false) cannot access the admin area routes.
     */
    public function test_non_admin_user_cannot_access_protected_admin_routes(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $protectedRoutes = ['/admin', '/dashboard'];

        foreach ($protectedRoutes as $route) {
            $response = $this->actingAs($user)->get($route);
            $response->assertStatus(403);
        }
    }

    /**
     * Test that admin users (is_admin = true) can access the admin area.
     */
    public function test_admin_user_can_access_admin_page(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin');
        $response->assertOk(); // Will fail for now — we haven't made the route
    }
}
