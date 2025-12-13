<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(): Response
    {
        $purchases = Purchase::with(['user', 'course'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Purchases/Index', [
            'purchases' => $purchases,
        ]);
    }
}
