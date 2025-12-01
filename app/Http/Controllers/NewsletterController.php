<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = $request->email;

        // Check if subscriber already exists
        $subscriber = NewsletterSubscriber::where('email', $email)->first();

        if ($subscriber) {
            if ($subscriber->isSubscribed()) {
                return back()->with('error', 'You are already subscribed to the newsletter.');
            } else {
                // Resubscribe if previously unsubscribed
                $subscriber->resubscribe();
                return back()->with('success', 'Welcome back! You have been resubscribed to the newsletter.');
            }
        }

        // Create new subscriber
        NewsletterSubscriber::create(['email' => $email]);

        return back()->with('success', 'Successfully subscribed!');
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

        if (!$subscriber->isSubscribed()) {
            return back()->with('error', 'You are already unsubscribed.');
        }

        $subscriber->unsubscribe();

        return back()->with('success', 'You have been unsubscribed from the newsletter.');
    }
}
