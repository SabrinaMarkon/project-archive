<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\Newsletter;
use App\Models\NewsletterSend;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class NewsletterSubscriberController extends Controller
{
    public function index()
    {
        $subscribers = NewsletterSubscriber::orderBy('created_at', 'desc')->paginate(15);

        $allSubscribers = NewsletterSubscriber::all();
        $stats = [
            'total' => $allSubscribers->count(),
            'active' => $allSubscribers->filter(fn($s) => $s->confirmed_at && !$s->unsubscribed_at)->count(),
            'unsubscribed' => $allSubscribers->filter(fn($s) => $s->unsubscribed_at)->count(),
            'pending' => $allSubscribers->filter(fn($s) => !$s->confirmed_at && !$s->unsubscribed_at)->count(),
        ];

        return Inertia::render('Admin/Newsletter/Index', [
            'subscribers' => $subscribers,
            'stats' => $stats,
        ]);
    }

    public function export()
    {
        $subscribers = NewsletterSubscriber::whereNotNull('confirmed_at')
            ->whereNull('unsubscribed_at')
            ->orderBy('created_at', 'desc')
            ->get(['email', 'created_at', 'confirmed_at']);

        $filename = 'subscribers.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($subscribers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['email', 'confirmed_at']);

            foreach ($subscribers as $subscriber) {
                fputcsv($file, [
                    $subscriber->email,
                    $subscriber->confirmed_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function unsubscribe(NewsletterSubscriber $subscriber)
    {
        $subscriber->update(['unsubscribed_at' => now()]);
        return redirect()->route('admin.newsletter.index');
    }

    public function destroy(NewsletterSubscriber $subscriber)
    {
        $subscriber->delete();
        return redirect()->route('admin.newsletter.index');
    }

    public function compose()
    {
        return Inertia::render('Admin/Newsletter/Compose');
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string',
            'body' => 'required|string',
            'format' => 'required|in:markdown,html,html_editor,plaintext',
        ]);

        $activeSubscribers = NewsletterSubscriber::whereNotNull('confirmed_at')
            ->whereNull('unsubscribed_at')
            ->get();

        if ($activeSubscribers->isEmpty()) {
            return redirect()->route('admin.newsletter.compose')->with('error', 'No active subscribers to send to.');
        }

        foreach ($activeSubscribers as $subscriber) {
            $unsubscribeUrl = URL::signedRoute('newsletter.unsubscribe', ['email' => $subscriber->email]);

            Mail::to($subscriber->email)->send(
                new Newsletter(
                    $validated['subject'],
                    $validated['body'],
                    $validated['format'],
                    $unsubscribeUrl
                )
            );
        }

        // Save newsletter to history
        NewsletterSend::create([
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'format' => $validated['format'],
            'recipient_count' => $activeSubscribers->count(),
            'sent_at' => now(),
        ]);

        return redirect()->route('admin.newsletter.compose')->with('success', 'Newsletter sent successfully!');
    }
}
