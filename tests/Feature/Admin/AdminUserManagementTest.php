<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_users_list(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        User::factory()->count(5)->create();

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users', 6) // 5 + admin
        );
    }

    public function test_non_admin_cannot_view_users_list(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_view_individual_user(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['name' => 'John Doe']);

        $response = $this->actingAs($admin)->get("/admin/users/{$user->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Show')
            ->where('user.name', 'John Doe')
        );
    }

    public function test_admin_can_update_user_admin_status(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($admin)
            ->patch("/admin/users/{$user->id}", [
                'is_admin' => true,
            ]);

        $response->assertRedirect('/admin/users');
        $this->assertTrue($user->fresh()->is_admin);
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create();

        $response = $this->actingAs($admin)
            ->delete("/admin/users/{$user->id}");

        $response->assertRedirect('/admin/users');
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_delete_themselves(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)
            ->delete("/admin/users/{$admin->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_users_list_shows_enrollment_count(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertInertia(fn ($page) => $page
            ->has('users.0.enrollments_count')
        );
    }

    public function test_admin_can_access_create_user_form(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin/users/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Create')
        );
    }

    public function test_non_admin_cannot_access_create_user_form(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/users/create');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_new_user(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'is_admin' => false,
        ]);

        $response->assertRedirect('/admin/users');
        $this->assertDatabaseHas('users', [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'is_admin' => false,
        ]);

        // Verify password was hashed
        $user = User::where('email', 'testuser@example.com')->first();
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('password123', $user->password));
    }

    public function test_user_creation_requires_name(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/users', [
            'email' => 'testuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_user_creation_requires_valid_email(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_user_creation_requires_unique_email(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_user_creation_requires_password_confirmation(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors('password');
    }

    public function test_admin_can_resend_verification_email(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['email_verified_at' => null]);

        \Illuminate\Support\Facades\Notification::fake();

        $response = $this->actingAs($admin)->post("/admin/users/{$user->id}/resend-verification");

        $response->assertRedirect("/admin/users/{$user->id}");
        $response->assertSessionHas('success', 'Verification email sent successfully.');

        \Illuminate\Support\Facades\Notification::assertSentTo(
            $user,
            \Illuminate\Auth\Notifications\VerifyEmail::class
        );
    }

    public function test_admin_can_resend_password_reset_email(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create();

        \Illuminate\Support\Facades\Notification::fake();

        $response = $this->actingAs($admin)->post("/admin/users/{$user->id}/resend-password-reset");

        $response->assertRedirect("/admin/users/{$user->id}");
        $response->assertSessionHas('success', 'Password reset email sent successfully.');

        \Illuminate\Support\Facades\Notification::assertSentTo(
            $user,
            \Illuminate\Auth\Notifications\ResetPassword::class
        );
    }
}
