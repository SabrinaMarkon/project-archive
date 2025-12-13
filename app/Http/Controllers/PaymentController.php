<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Purchase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class PaymentController extends Controller
{
    public function createCheckoutSession(Request $request, Course $course): JsonResponse
    {
        // Check if user is authenticated
        if (!$request->user()) {
            abort(401, 'You must be logged in to purchase a course.');
        }

        // Check if Stripe is enabled for this course
        if (!$course->stripe_enabled) {
            abort(403, 'Stripe payments are not enabled for this course.');
        }

        // Check if user is already enrolled
        if ($request->user()->isEnrolledIn($course)) {
            abort(403, 'You are already enrolled in this course.');
        }

        // Set Stripe API key
        Stripe::setApiKey(config('services.stripe.secret'));

        // Determine if this is a subscription or one-time payment
        $isSubscription = in_array($course->payment_type, ['monthly', 'yearly', 'subscription']);

        // Prepare checkout session data
        $sessionData = [
            'payment_method_types' => ['card'],
            'mode' => $isSubscription ? 'subscription' : 'payment',
            'success_url' => route('courses.show', $course) . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('courses.show', $course),
            'client_reference_id' => $request->user()->id,
            'metadata' => [
                'user_id' => $request->user()->id,
                'course_id' => $course->id,
            ],
        ];

        if ($isSubscription) {
            // For subscriptions, we need to create a price in Stripe or use existing price ID
            // For now, we'll create a new price on the fly
            $sessionData['line_items'] = [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $course->title,
                        'description' => $course->description ?? '',
                    ],
                    'unit_amount' => (int)($course->price * 100), // Convert to cents
                    'recurring' => [
                        'interval' => $course->payment_type === 'yearly' ? 'year' : 'month',
                    ],
                ],
                'quantity' => 1,
            ]];
        } else {
            // One-time payment
            $sessionData['line_items'] = [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $course->title,
                        'description' => $course->description ?? '',
                    ],
                    'unit_amount' => (int)($course->price * 100), // Convert to cents
                ],
                'quantity' => 1,
            ]];
        }

        // Create the checkout session
        $session = Session::create($sessionData);

        return response()->json(['url' => $session->url]);
    }
}
