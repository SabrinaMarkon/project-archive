<?php

namespace Tests\Feature\Newsletter;

use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsletterSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_subscribe_to_newsletter(): void
    {
        $response = $this->post('/newsletter/subscribe', [
            'email' => 'test@example.com',
        ]);

        $response->assertRedirect()
            ->assertSessionHas('success', 'Successfully subscribed!');

        $this->assertDatabaseHas('newsletter_subscribers', [
            'email' => 'test@example.com',
            'unsubscribed_at' => null,
        ]);
    }

    public function test_duplicate_subscription_returns_appropriate_message(): void
    {
        NewsletterSubscriber::create(['email' => 'test@example.com']);

        $response = $this->post('/newsletter/subscribe', [
            'email' => 'test@example.com',
        ]);

        $response->assertRedirect()
            ->assertSessionHas('error', 'You are already subscribed to the newsletter.');
    }

    public function test_invalid_email_validation(): void
    {
        $response = $this->post('/newsletter/subscribe', [
            'email' => 'not-an-email',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_empty_email_validation(): void
    {
        $response = $this->post('/newsletter/subscribe', [
            'email' => '',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_user_can_resubscribe_after_unsubscribing(): void
    {
        $subscriber = NewsletterSubscriber::create([
            'email' => 'test@example.com',
            'unsubscribed_at' => now(),
        ]);

        $this->assertTrue($subscriber->unsubscribed_at !== null);

        $response = $this->post('/newsletter/subscribe', [
            'email' => 'test@example.com',
        ]);

        $response->assertRedirect()
            ->assertSessionHas('success', 'Welcome back! You have been resubscribed to the newsletter.');

        $subscriber->refresh();
        $this->assertNull($subscriber->unsubscribed_at);
    }

    public function test_user_can_unsubscribe_from_newsletter(): void
    {
        NewsletterSubscriber::create(['email' => 'test@example.com']);

        $response = $this->post('/newsletter/unsubscribe', [
            'email' => 'test@example.com',
        ]);

        $response->assertRedirect()
            ->assertSessionHas('success', 'You have been unsubscribed from the newsletter.');

        $this->assertDatabaseHas('newsletter_subscribers', [
            'email' => 'test@example.com',
        ]);

        $subscriber = NewsletterSubscriber::where('email', 'test@example.com')->first();
        $this->assertNotNull($subscriber->unsubscribed_at);
    }

    public function test_unsubscribe_with_nonexistent_email(): void
    {
        $response = $this->post('/newsletter/unsubscribe', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertRedirect()
            ->assertSessionHas('error', 'Email address not found.');
    }

    public function test_unsubscribe_already_unsubscribed_user(): void
    {
        NewsletterSubscriber::create([
            'email' => 'test@example.com',
            'unsubscribed_at' => now(),
        ]);

        $response = $this->post('/newsletter/unsubscribe', [
            'email' => 'test@example.com',
        ]);

        $response->assertRedirect()
            ->assertSessionHas('error', 'You are already unsubscribed.');
    }

    public function test_unsubscribe_with_invalid_email(): void
    {
        $response = $this->post('/newsletter/unsubscribe', [
            'email' => 'not-an-email',
        ]);

        $response->assertSessionHasErrors('email');
    }
}
