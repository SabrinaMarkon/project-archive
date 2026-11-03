<?php

namespace Tests\Feature\Newsletter;

use App\Mail\NewsletterConfirmation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NewsletterTurnstileTest extends TestCase
{
    use RefreshDatabase;

    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.turnstile.enabled', true);
        config()->set('services.turnstile.secret_key', 'test-secret');
    }

    public function test_subscribe_without_token_is_rejected(): void
    {
        Mail::fake();
        Http::fake();

        $this->post('/newsletter/subscribe', ['email' => 'test@example.com'])
            ->assertSessionHasErrors('cf-turnstile-response');

        Mail::assertNothingSent();
        Http::assertNothingSent();
    }

    public function test_subscribe_with_valid_token_sends_confirmation(): void
    {
        Mail::fake();
        Http::fake([self::VERIFY_URL => Http::response(['success' => true])]);

        $this->post('/newsletter/subscribe', [
            'email' => 'test@example.com',
            'cf-turnstile-response' => 'valid-token',
        ])->assertSessionHas('success');

        Mail::assertSent(NewsletterConfirmation::class, 1);
    }

    public function test_subscribe_with_failed_verification_is_rejected(): void
    {
        Mail::fake();
        Http::fake([self::VERIFY_URL => Http::response([
            'success' => false,
            'error-codes' => ['invalid-input-response'],
        ])]);

        $this->post('/newsletter/subscribe', [
            'email' => 'test@example.com',
            'cf-turnstile-response' => 'bad-token',
        ])->assertSessionHasErrors('cf-turnstile-response');

        Mail::assertNothingSent();
    }

    public function test_turnstile_site_key_is_shared_with_pages(): void
    {
        config()->set('services.turnstile.site_key', 'test-site-key');

        $this->get('/')
            ->assertInertia(fn ($page) => $page
                ->where('turnstile.siteKey', 'test-site-key')
                ->where('turnstile.enabled', true));
    }
    
    public function test_verification_request_carries_secret_token_and_ip(): void
    {
        Mail::fake();
        Http::fake([self::VERIFY_URL => Http::response(['success' => true])]);

        $this->post('/newsletter/subscribe', [
            'email' => 'test@example.com',
            'cf-turnstile-response' => 'valid-token',
        ]);

        Http::assertSent(function (Request $request) {
            return $request->url() === self::VERIFY_URL
                && $request['secret'] === 'test-secret'
                && $request['response'] === 'valid-token'
                && $request['remoteip'] === '127.0.0.1';
        });
    }

    public function test_verification_service_outage_rejects_submission(): void
    {
        Mail::fake();
        Http::fake([self::VERIFY_URL => Http::response([], 500)]);

        $this->post('/newsletter/subscribe', [
            'email' => 'test@example.com',
            'cf-turnstile-response' => 'valid-token',
        ])->assertSessionHasErrors('cf-turnstile-response');

        Mail::assertNothingSent();
    }
}
