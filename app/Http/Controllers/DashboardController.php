<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function purchases(Request $request): Response
    {
        $purchases = $request->user()
            ->purchases()
            ->with('course')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard/Purchases', [
            'purchases' => $purchases,
        ]);
    }
}
