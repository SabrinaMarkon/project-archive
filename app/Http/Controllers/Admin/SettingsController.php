<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings', [
            'settings' => [
                'stripe_public_key' => Setting::get('stripe_public_key', ''),
                'stripe_secret_key' => Setting::get('stripe_secret_key', '') ? '••••••••' : '',
                'stripe_webhook_secret' => Setting::get('stripe_webhook_secret', '') ? '••••••••' : '',
                'paypal_client_id' => Setting::get('paypal_client_id', ''),
                'paypal_secret' => Setting::get('paypal_secret', '') ? '••••••••' : '',
                'stripe_enabled' => Setting::get('stripe_enabled', '0') === '1',
                'paypal_enabled' => Setting::get('paypal_enabled', '0') === '1',
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'stripe_public_key' => 'nullable|string|max:255',
            'stripe_secret_key' => 'nullable|string|max:255',
            'stripe_webhook_secret' => 'nullable|string|max:255',
            'paypal_client_id' => 'nullable|string|max:255',
            'paypal_secret' => 'nullable|string|max:255',
            'stripe_enabled' => 'boolean',
            'paypal_enabled' => 'boolean',
        ]);

        // Save non-secret settings
        Setting::set('stripe_enabled', $validated['stripe_enabled'] ? '1' : '0');
        Setting::set('paypal_enabled', $validated['paypal_enabled'] ? '1' : '0');

        // Save public keys (not encrypted)
        if ($request->filled('stripe_public_key')) {
            Setting::set('stripe_public_key', $validated['stripe_public_key']);
        }
        if ($request->filled('paypal_client_id')) {
            Setting::set('paypal_client_id', $validated['paypal_client_id']);
        }

        // Save secret keys (encrypted) - only if not placeholder
        if ($request->filled('stripe_secret_key') && $validated['stripe_secret_key'] !== '••••••••') {
            Setting::set('stripe_secret_key', $validated['stripe_secret_key'], true);
        }
        if ($request->filled('stripe_webhook_secret') && $validated['stripe_webhook_secret'] !== '••••••••') {
            Setting::set('stripe_webhook_secret', $validated['stripe_webhook_secret'], true);
        }
        if ($request->filled('paypal_secret') && $validated['paypal_secret'] !== '••••••••') {
            Setting::set('paypal_secret', $validated['paypal_secret'], true);
        }

        return redirect()->route('admin.settings')->with('success', 'Settings updated successfully!');
    }
}
