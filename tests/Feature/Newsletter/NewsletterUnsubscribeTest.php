<?php

namespace Tests\Feature\Newsletter;

use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class NewsletterUnsubscribeTest extends TestCase
{
    use RefreshDatabase;

    public function test_clicking_unsubscribe_link_marks_subscriber_as_unsubscribed(): void
    {
        // Create a confirmed subscriber
        $subscriber = NewsletterSubscriber::create([
            'email' => 'test@example.com',
            'confirmed_at' => now(),
        ]);

        // Generate permanent signed unsubscribe URL (never expires)
        $signedUrl = URL::signedRoute(
            'newsletter.unsubscribe',
            ['email' => 'test@example.com']
        );

        $response = $this->get($signedUrl);

        $response->assertOk();

        $subscriber->refresh();
        $this->assertNotNull($subscriber->unsubscribed_at);
        $this->assertNotNull($subscriber->confirmed_at);
    }

    public function test_invalid_signature_shows_error(): void
    {
        $response = $this->get('/newsletter/unsubscribe?email=test@example.com&signature=invalid');

        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page
                ->component('Newsletter/Unsubscribed')
                ->where('success', false)
        );
    }

    public function test_unsubscribing_nonexistent_email_still_shows_success(): void
    {
        // Don't reveal if email exists or not (privacy)
        $signedUrl = URL::signedRoute(
            'newsletter.unsubscribe',
            ['email' => 'nonexistent@example.com']
        );

        $response = $this->get($signedUrl);

        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page
                ->component('Newsletter/Unsubscribed')
                ->where('success', true)
        );
    }

    public function test_unsubscribing_twice_works_gracefully(): void
    {
        $subscriber = NewsletterSubscriber::create([
            'email' => 'test@example.com',
            'confirmed_at' => now(),
        ]);

        $signedUrl = URL::signedRoute(
            'newsletter.unsubscribe',
            ['email' => 'test@example.com']
        );

        $this->get($signedUrl);
        $this->get($signedUrl);

        $subscriber->refresh();
        $this->assertNotNull($subscriber->unsubscribed_at);
    }

    public function test_resubscribing_after_unsubscribe_requires_new_confirmation(): void
    {
        // This test verifies the flow works correctly when someone
        // unsubscribes and then tries to subscribe again
        $subscriber = NewsletterSubscriber::create([
            'email' => 'test@example.com',
            'confirmed_at' => now(),
            'unsubscribed_at' => now(),
        ]);

        $this->assertNotNull($subscriber->unsubscribed_at);
        $this->assertNotNull($subscriber->confirmed_at);

        // When they subscribe again, the confirm() method should clear unsubscribed_at
        $confirmUrl = URL::temporarySignedRoute(
            'newsletter.confirm',
            now()->addHours(24),
            ['email' => 'test@example.com']
        );

        $this->get($confirmUrl);

        $subscriber->refresh();
        $this->assertNotNull($subscriber->confirmed_at);
        $this->assertNull($subscriber->unsubscribed_at);
    }
}
