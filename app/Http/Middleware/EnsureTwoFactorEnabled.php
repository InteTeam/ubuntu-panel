<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureTwoFactorEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->hasTwoFactorEnabled()) {
            if (!$request->routeIs('two-factor.*')) {
                return redirect()->route('two-factor.setup');
            }
        }

        return $next($request);
    }
}
