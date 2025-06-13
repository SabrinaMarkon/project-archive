<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_the_admin_area(): void
    {
        $response = $this->get('/admin');
        $response->assertRedirect('/login');
    }

    public function test_non_admin_user_cannot_access_protected_admin_routes(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $protectedRoutes = ['/admin', '/dashboard'];

        foreach ($protectedRoutes as $route) {
            $response = $this->actingAs($user)->get($route);
            $response->assertStatus(403);
        }
    }

    public function test_admin_user_can_access_admin_area_pages(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $routes = ['/admin', '/dashboard'];

        foreach ($routes as $route) {
            $response = $this->actingAs($admin)->get($route);
            $response->assertOk();
        }
    }
}
