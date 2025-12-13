<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StripeWebhookController extends Controller
{
    public function handleWebhook(Request $request): Response
    {
        $payload = $request->all();
        $eventType = $payload['type'] ?? null;

        if (!$eventType) {
            return response('Invalid webhook payload', 400);
        }

        switch ($eventType) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($payload['data']['object']);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($payload['data']['object']);
                break;

            default:
                // Unhandled event type
                break;
        }

        return response('Webhook received', 200);
    }

    protected function handleCheckoutSessionCompleted(array $session): void
    {
        $userId = $session['metadata']['user_id'] ?? null;
        $courseId = $session['metadata']['course_id'] ?? null;

        if (!$userId || !$courseId) {
            return;
        }

        $user = User::find($userId);
        $course = Course::find($courseId);

        if (!$user || !$course) {
            return;
        }

        // Determine if this is a subscription or one-time payment
        $isSubscription = isset($session['subscription']);
        $paymentIntentId = $session['payment_intent'] ?? null;
        $subscriptionId = $session['subscription'] ?? null;
        $amountTotal = $session['amount_total'] ?? 0;
        $currency = $session['currency'] ?? 'usd';

        // Create purchase record
        $purchase = Purchase::create([
            'user_id' => $userId,
            'course_id' => $courseId,
            'stripe_payment_intent_id' => $paymentIntentId,
            'stripe_subscription_id' => $subscriptionId,
            'amount' => $amountTotal / 100, // Convert from cents
            'currency' => $currency,
            'status' => 'completed',
            'payment_type' => $isSubscription ? 'subscription' : 'one_time',
            'purchased_at' => now(),
        ]);

        // Enroll user in course if not already enrolled
        if (!$user->isEnrolledIn($course)) {
            $user->enrollments()->create([
                'course_id' => $courseId,
                'enrolled_at' => now(),
            ]);
        }
    }

    protected function handlePaymentFailed(array $paymentIntent): void
    {
        $paymentIntentId = $paymentIntent['id'] ?? null;

        if (!$paymentIntentId) {
            return;
        }

        // Find the purchase by payment intent ID and mark as failed
        Purchase::where('stripe_payment_intent_id', $paymentIntentId)
            ->update(['status' => 'failed']);
    }
}
