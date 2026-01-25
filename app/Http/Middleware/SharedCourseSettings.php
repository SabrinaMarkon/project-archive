<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia; // Used to share data
use App\Models\Setting; // Used to get the payment settings for all courses

class SharedCourseSettings
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // The payment method has to be BOTH enabled AND properly configured with keys.
        $stripeConfigured = Setting::get('stripe_enabled') && !empty(Setting::get('stripe_secret_key'));
        $paypalConfigured = Setting::get('paypal_enabled') && !empty(Setting::get('paypal_client_id')) && !empty(Setting::get('paypal_secret'));

        // Share the calculated data under a single, dedicated key
        Inertia::share([
            'sharedCourseSettings' => [
                'paymentSettings' => [
                    'stripeConfigured' => (bool) $stripeConfigured,
                    'paypalConfigured' => (bool) $paypalConfigured,
                ],
            ],
        ]);

        return $next($request);
    }
}
