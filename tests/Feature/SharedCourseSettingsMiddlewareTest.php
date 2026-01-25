<?php

namespace Tests\Feature;

use App\Http\Middleware\SharedCourseSettings;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class SharedCourseSettingsMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_shares_payment_settings_when_both_stripe_and_paypal_are_configured()
    {
        Setting::set('stripe_enabled', true);
        Setting::set('stripe_secret_key', 'sk_test_123');
        Setting::set('paypal_enabled', true);
        Setting::set('paypal_client_id', 'paypal_client_123');
        Setting::set('paypal_secret', 'paypal_secret_123');

        $response = $this->get('/courses');

        $sharedData = $response->viewData('page')['props']['sharedCourseSettings'];

        $this->assertTrue($sharedData['paymentSettings']['stripeConfigured']);
        $this->assertTrue($sharedData['paymentSettings']['paypalConfigured']);
    }

    /** @test */
    public function stripe_not_configured_when_enabled_but_missing_secret_key()
    {
        Setting::set('stripe_enabled', true);
        Setting::set('stripe_secret_key', '');

        $response = $this->get('/courses');

        $sharedData = $response->viewData('page')['props']['sharedCourseSettings'];

        $this->assertFalse($sharedData['paymentSettings']['stripeConfigured']);
    }

    /** @test */
    public function stripe_not_configured_when_disabled()
    {
        Setting::set('stripe_enabled', false);
        Setting::set('stripe_secret_key', 'sk_test_123');

        $response = $this->get('/courses');

        $sharedData = $response->viewData('page')['props']['sharedCourseSettings'];

        $this->assertFalse($sharedData['paymentSettings']['stripeConfigured']);
    }

    /** @test */
    public function paypal_not_configured_when_enabled_but_missing_credentials()
    {
        Setting::set('paypal_enabled', true);
        Setting::set('paypal_client_id', '');
        Setting::set('paypal_secret', '');

        $response = $this->get('/courses');

        $sharedData = $response->viewData('page')['props']['sharedCourseSettings'];

        $this->assertFalse($sharedData['paymentSettings']['paypalConfigured']);
    }

    /** @test */
    public function paypal_not_configured_when_missing_client_id_only()
    {
        Setting::set('paypal_enabled', true);
        Setting::set('paypal_client_id', '');
        Setting::set('paypal_secret', 'secret_123');

        $response = $this->get('/courses');

        $sharedData = $response->viewData('page')['props']['sharedCourseSettings'];

        $this->assertFalse($sharedData['paymentSettings']['paypalConfigured']);
    }

    /** @test */
    public function paypal_not_configured_when_missing_secret_only()
    {
        Setting::set('paypal_enabled', true);
        Setting::set('paypal_client_id', 'client_123');
        Setting::set('paypal_secret', '');

        $response = $this->get('/courses');

        $sharedData = $response->viewData('page')['props']['sharedCourseSettings'];

        $this->assertFalse($sharedData['paymentSettings']['paypalConfigured']);
    }

    /** @test */
    public function both_payment_methods_not_configured_when_disabled()
    {
        Setting::set('stripe_enabled', false);
        Setting::set('paypal_enabled', false);

        $response = $this->get('/courses');

        $sharedData = $response->viewData('page')['props']['sharedCourseSettings'];

        $this->assertFalse($sharedData['paymentSettings']['stripeConfigured']);
        $this->assertFalse($sharedData['paymentSettings']['paypalConfigured']);
    }
}
