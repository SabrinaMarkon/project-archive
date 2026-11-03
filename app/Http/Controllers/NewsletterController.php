<?php

namespace App\Http\Controllers;

use App\Mail\NewsletterConfirmation;
use App\Models\NewsletterSubscriber;
use App\Rules\TurnstileToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $successMessage = 'Please check your email to confirm your subscription!';

        // Honeypot: real visitors never see or fill this field.
        if ($request->filled('website')) {
            return back()->with('success', $successMessage);
        }

        $rules = [
            'email' => 'required|email|max:255',
        ];

        if (config('services.turnstile.enabled')) {
            $rules['cf-turnstile-response'] = ['required', new TurnstileToken];
        }

        $request->validate($rules, [
            'cf-turnstile-response.required' => 'Please complete the verification.',
        ]);

        $email = $request->email;

        // Already confirmed and still subscribed: send nothing.
        $alreadySubscribed = NewsletterSubscriber::where('email', $email)
            ->whereNotNull('confirmed_at')
            ->whereNull('unsubscribed_at')
            ->exists();

        if ($alreadySubscribed) {
            return back()->with('success', $successMessage);
        }
        
        // At most one confirmation email per address every 10 minutes.
        $cooldownKey = 'newsletter:confirmation:' . sha1(Str::lower($email));

        if (! Cache::add($cooldownKey, true, now()->addMinutes(10))) {
            return back()->with('success', $successMessage);
        }

        // Generate signed URL (expires in 24 hours)
        $confirmationUrl = URL::temporarySignedRoute(
            'newsletter.confirm',
            now()->addHours(24),
            ['email' => $email]
        );

        // Send confirmation email via Resend
        Mail::to($email)->send(new NewsletterConfirmation($confirmationUrl));

        return back()->with('success', $successMessage);
    }

    public function confirm(Request $request)
    {
        // Validate the signed URL
        if (!$request->hasValidSignature()) {
            return Inertia::render('Newsletter/Confirmed', [
                'success' => false,
                'message' => 'This confirmation link is invalid or has expired.',
            ]);
        }

        $email = $request->email;

        // Check if already confirmed AND not unsubscribed
        $existing = NewsletterSubscriber::where('email', $email)->first();

        if ($existing && $existing->confirmed_at && !$existing->unsubscribed_at) {
            return Inertia::render('Newsletter/Confirmed', [
                'success' => true,
                'message' => 'You are already subscribed!',
            ]);
        }

        // Create or update subscriber as confirmed (clears unsubscribed_at if resubscribing)
        NewsletterSubscriber::updateOrCreate(
            ['email' => $email],
            [
                'confirmed_at' => now(),
                'unsubscribed_at' => null,
            ]
        );

        return Inertia::render('Newsletter/Confirmed', [
            'success' => true,
            'message' => 'Thank you! Your subscription is confirmed.',
        ]);
    }

    public function unsubscribe(Request $request)
    {
        // Validate the signed URL
        if (!$request->hasValidSignature()) {
            return Inertia::render('Newsletter/Unsubscribed', [
                'success' => false,
                'message' => 'This unsubscribe link is invalid.',
            ]);
        }

        $email = $request->email;

        // Find subscriber
        $subscriber = NewsletterSubscriber::where('email', $email)->first();

        if ($subscriber) {
            // Mark as unsubscribed (even if already unsubscribed - idempotent)
            $subscriber->update(['unsubscribed_at' => now()]);
        }

        // Always show success to avoid revealing if email exists (privacy)
        return Inertia::render('Newsletter/Unsubscribed', [
            'success' => true,
            'message' => 'You have been successfully unsubscribed from the newsletter.',
        ]);
    }
}
