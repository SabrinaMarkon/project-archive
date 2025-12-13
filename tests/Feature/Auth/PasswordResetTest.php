<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_reset_link_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Auth/ForgotPassword'));
    }

    public function test_password_reset_link_can_be_requested(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        Notification::assertSentTo($user, ResetPassword::class);
        $response->assertSessionHas('status');
    }

    public function test_password_reset_link_email_is_actually_sent(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'test@example.com']);

        $this->post('/forgot-password', [
            'email' => 'test@example.com',
        ]);

        // Verify notification was sent to the correct user
        Notification::assertSentTo(
            $user,
            ResetPassword::class,
            function ($notification) use ($user) {
                // Verify the notification can generate a reset URL
                $url = $notification->toMail($user)->actionUrl;
                return str_contains($url, '/reset-password/');
            }
        );
    }

    public function test_password_reset_screen_can_be_rendered(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $token = $notification->token;

            $response = $this->get('/reset-password/'.$token.'?email='.$user->email);

            $response->assertStatus(200);
            $response->assertInertia(fn ($page) => $page->component('Auth/ResetPassword'));

            return true;
        });
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $oldPassword = $user->password;

        $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user, $oldPassword) {
            $token = $notification->token;

            $response = $this->post('/reset-password', [
                'token' => $token,
                'email' => $user->email,
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

            $response->assertSessionHasNoErrors();
            $response->assertRedirect('/login');

            // Verify password was actually changed
            $user->refresh();
            $this->assertNotEquals($oldPassword, $user->password);
            $this->assertTrue(Hash::check('new-password', $user->password));

            // Verify user can login with new password
            $loginResponse = $this->post('/login', [
                'email' => $user->email,
                'password' => 'new-password',
            ]);

            $this->assertAuthenticated();

            return true;
        });
    }

    public function test_password_cannot_be_reset_with_invalid_token(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/reset-password', [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_password_reset_requires_valid_email(): void
    {
        $response = $this->post('/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        // Laravel actually shows an error for non-existent emails
        $response->assertSessionHasErrors('email');
    }

    public function test_password_reset_requires_password_confirmation(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $token = $notification->token;

            $response = $this->post('/reset-password', [
                'token' => $token,
                'email' => $user->email,
                'password' => 'new-password',
                'password_confirmation' => 'different-password',
            ]);

            $response->assertSessionHasErrors('password');

            return true;
        });
    }

    public function test_password_reset_requires_minimum_length(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $token = $notification->token;

            $response = $this->post('/reset-password', [
                'token' => $token,
                'email' => $user->email,
                'password' => 'short',
                'password_confirmation' => 'short',
            ]);

            $response->assertSessionHasErrors('password');

            return true;
        });
    }

    public function test_password_reset_token_expires_after_use(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $token = $notification->token;

            // Reset password once
            $this->post('/reset-password', [
                'token' => $token,
                'email' => $user->email,
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

            // Try to use the same token again
            $response = $this->post('/reset-password', [
                'token' => $token,
                'email' => $user->email,
                'password' => 'another-password',
                'password_confirmation' => 'another-password',
            ]);

            $response->assertSessionHasErrors('email');

            return true;
        });
    }
}
