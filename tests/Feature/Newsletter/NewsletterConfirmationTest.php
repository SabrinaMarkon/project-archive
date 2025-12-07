<?php

namespace Tests\Feature\Newsletter;

use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class NewsletterConfirmationTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscribing_does_not_create_database_record_immediately(): void
    {
        Mail::fake();

        $response = $this->post('/newsletter/subscribe', [
            'email' => 'test@example.com',
        ]);

        $this->assertDatabaseCount('newsletter_subscribers', 0);
    }

    public function test_subscribing_sends_confirmation_email(): void
    {
        Mail::fake();

        $response = $this->post('/newsletter/subscribe', [
            'email' => 'test@example.com',
        ]);

        Mail::assertSent(\App\Mail\NewsletterConfirmation::class, function ($mail) {
            return $mail->hasTo('test@example.com');
        });
    }

    public function test_clicking_confirmation_link_creates_confirmed_subscriber(): void
    {
        $signedUrl = URL::temporarySignedRoute(
            'newsletter.confirm',
            now()->addHours(24),
            ['email' => 'test@example.com']
        );

        $response = $this->get($signedUrl);

        $response->assertOk();

        $subscriber = NewsletterSubscriber::where('email', 'test@example.com')->first();
        $this->assertNotNull($subscriber);
        $this->assertNotNull($subscriber->confirmed_at);
        $this->assertNull($subscriber->unsubscribed_at);
    }

    public function test_expired_confirmation_link_shows_error(): void
    {
        // Create URL that expired 1 hour ago
        $expiredUrl = URL::temporarySignedRoute(
            'newsletter.confirm',
            now()->subHour(),
            ['email' => 'test@example.com']
        );

        $response = $this->get($expiredUrl);

        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page
                ->component('Newsletter/Confirmed')
                ->where('success', false)
                ->where('message', 'This confirmation link is invalid or has expired.')
        );

        $this->assertDatabaseCount('newsletter_subscribers', 0);
    }

    public function test_invalid_signature_shows_error(): void
    {
        $response = $this->get('/newsletter/confirm?email=test@example.com&signature=invalid');

        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page
                ->component('Newsletter/Confirmed')
                ->where('success', false)
        );

        $this->assertDatabaseCount('newsletter_subscribers', 0);
    }

    public function test_confirming_twice_does_not_create_duplicate(): void
    {
        $signedUrl = URL::temporarySignedRoute(
            'newsletter.confirm',
            now()->addHours(24),
            ['email' => 'test@example.com']
        );

        $this->get($signedUrl);
        $this->get($signedUrl);

        $this->assertDatabaseCount('newsletter_subscribers', 1);
    }

    public function test_subscribe_success_message_mentions_checking_email(): void
    {
        Mail::fake();

        $response = $this->post('/newsletter/subscribe', [
            'email' => 'test@example.com',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertStringContainsString('check your email', strtolower(session('success')));
    }

    public function test_resubscribing_with_same_email_sends_new_confirmation(): void
    {
        Mail::fake();

        $this->post('/newsletter/subscribe', ['email' => 'test@example.com']);
        $this->post('/newsletter/subscribe', ['email' => 'test@example.com']);

        Mail::assertSent(\App\Mail\NewsletterConfirmation::class, 2);
    }

    public function test_confirmation_email_contains_signed_url(): void
    {
        Mail::fake();

        $this->post('/newsletter/subscribe', ['email' => 'test@example.com']);

        Mail::assertSent(\App\Mail\NewsletterConfirmation::class, function ($mail) {
            return str_contains($mail->render(), 'signature=');
        });
    }
}
