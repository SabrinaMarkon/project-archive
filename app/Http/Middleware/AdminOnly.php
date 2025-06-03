<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\MiddlewareName;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

#[MiddlewareName('admin')]
class AdminOnly
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            abort(403);
        }

        return $next($request);
    }
}
