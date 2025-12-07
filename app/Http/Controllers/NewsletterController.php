<?php

namespace App\Http\Controllers;

use App\Mail\NewsletterConfirmation;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = $request->email;

        // Generate signed URL (expires in 24 hours)
        $confirmationUrl = URL::temporarySignedRoute(
            'newsletter.confirm',
            now()->addHours(24),
            ['email' => $email]
        );

        // Send confirmation email via Resend
        Mail::to($email)->send(new NewsletterConfirmation($confirmationUrl));

        return back()->with('success', 'Please check your email to confirm your subscription!');
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

        // Check if already confirmed
        $existing = NewsletterSubscriber::where('email', $email)->first();

        if ($existing && $existing->confirmed_at) {
            return Inertia::render('Newsletter/Confirmed', [
                'success' => true,
                'message' => 'You are already subscribed!',
            ]);
        }

        // Create or update subscriber as confirmed
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
        $request->validate([
            'email' => 'required|email',
        ]);

        $subscriber = NewsletterSubscriber::where('email', $request->email)->first();

        if (!$subscriber) {
            return back()->with('error', 'Email address not found.');
        }

        if ($subscriber->unsubscribed_at) {
            return back()->with('error', 'You are already unsubscribed.');
        }

        $subscriber->update(['unsubscribed_at' => now()]);

        return back()->with('success', 'You have been unsubscribed from the newsletter.');
    }
}
