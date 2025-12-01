<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsletterSubscriberController extends Controller
{
    public function index()
    {
        $subscribers = NewsletterSubscriber::orderBy('created_at', 'desc')->get();

        $stats = [
            'total' => NewsletterSubscriber::count(),
            'subscribed' => NewsletterSubscriber::subscribed()->count(),
            'unsubscribed' => NewsletterSubscriber::unsubscribed()->count(),
        ];

        return Inertia::render('Admin/Newsletter/Index', [
            'subscribers' => $subscribers,
            'stats' => $stats,
        ]);
    }

    public function export()
    {
        $subscribers = NewsletterSubscriber::subscribed()
            ->orderBy('created_at', 'desc')
            ->get(['email', 'created_at']);

        $filename = 'newsletter-subscribers-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($subscribers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Email', 'Subscribed Date']);

            foreach ($subscribers as $subscriber) {
                fputcsv($file, [
                    $subscriber->email,
                    $subscriber->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function destroy(NewsletterSubscriber $subscriber)
    {
        // If already unsubscribed, delete permanently
        if (!$subscriber->isSubscribed()) {
            $subscriber->delete();
            return redirect()->route('admin.newsletter.index')->with('success', 'Subscriber deleted permanently.');
        }

        // Otherwise, just unsubscribe
        $subscriber->unsubscribe();
        return redirect()->route('admin.newsletter.index')->with('success', 'Subscriber unsubscribed successfully.');
    }
}
