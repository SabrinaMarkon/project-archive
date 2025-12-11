<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSend;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsletterHistoryController extends Controller
{
    public function index()
    {
        $newsletters = NewsletterSend::orderBy('sent_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Newsletter/History', [
            'newsletters' => $newsletters,
        ]);
    }

    public function show(NewsletterSend $newsletterSend)
    {
        return Inertia::render('Admin/Newsletter/View', [
            'newsletter' => $newsletterSend,
        ]);
    }

    public function destroy(NewsletterSend $newsletterSend)
    {
        $newsletterSend->delete();

        return redirect('/admin/newsletter/history')
            ->with('success', 'Newsletter deleted successfully.');
    }
}
