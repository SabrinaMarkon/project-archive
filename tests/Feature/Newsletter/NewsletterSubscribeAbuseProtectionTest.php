<?php

namespace Tests\Feature\Newsletter;

use App\Mail\NewsletterConfirmation;
use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NewsletterSubscribeAbuseProtectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_cooldown_treats_email_case_insensitively(): void
    {
        Mail::fake();

        $this->post('/newsletter/subscribe', ['email' => 'Test@Example.com']);
        $this->post('/newsletter/subscribe', ['email' => 'test@example.com']);

        Mail::assertSent(NewsletterConfirmation::class, 1);
    }

    public function test_different_addresses_each_receive_a_confirmation(): void
    {
        Mail::fake();

        $this->post('/newsletter/subscribe', ['email' => 'one@example.com']);
        $this->post('/newsletter/subscribe', ['email' => 'two@example.com']);

        Mail::assertSent(NewsletterConfirmation::class, 2);
    }

    public function test_ip_address_is_limited_to_five_subscribe_requests_per_hour(): void
    {
        Mail::fake();

        for ($i = 1; $i <= 5; $i++) {
            $this->post('/newsletter/subscribe', ['email' => "user{$i}@example.com"])
                ->assertSessionHas('success');
        }

        $this->post('/newsletter/subscribe', ['email' => 'user6@example.com'])
            ->assertStatus(429);

        Mail::assertSent(NewsletterConfirmation::class, 5);
    }

    public function test_ip_limit_resets_after_an_hour(): void
    {
        Mail::fake();

        for ($i = 1; $i <= 5; $i++) {
            $this->post('/newsletter/subscribe', ['email' => "user{$i}@example.com"]);
        }

        $this->travel(61)->minutes();

        $this->post('/newsletter/subscribe', ['email' => 'user6@example.com'])
            ->assertSessionHas('success');

        Mail::assertSent(NewsletterConfirmation::class, 6);
    }

    public function test_already_confirmed_address_receives_no_email(): void
    {
        Mail::fake();

        NewsletterSubscriber::create([
            'email' => 'member@example.com',
            'confirmed_at' => now(),
            'unsubscribed_at' => null,
        ]);

        $this->post('/newsletter/subscribe', ['email' => 'member@example.com'])
            ->assertSessionHas('success');

        Mail::assertNothingSent();
    }

    public function test_unsubscribed_address_can_resubscribe(): void
    {
        Mail::fake();

        NewsletterSubscriber::create([
            'email' => 'former@example.com',
            'confirmed_at' => now()->subMonth(),
            'unsubscribed_at' => now()->subWeek(),
        ]);

        $this->post('/newsletter/subscribe', ['email' => 'former@example.com']);

        Mail::assertSent(NewsletterConfirmation::class, 1);
    }

    public function test_filled_honeypot_sends_no_email_but_shows_success(): void
    {
        Mail::fake();

        $this->post('/newsletter/subscribe', [
            'email' => 'bot@example.com',
            'website' => 'http://spam.example',
        ])->assertSessionHas('success');

        Mail::assertNothingSent();
    }
}
