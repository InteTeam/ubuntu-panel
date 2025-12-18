<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\LoginAttempt;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class LoginController extends Controller
{
    public function show(): Response|RedirectResponse
    {
        if (!User::exists()) {
            return redirect()->route('setup');
        }

        return Inertia::render('Auth/Login');
    }

    public function store(LoginRequest $request): RedirectResponse|\Illuminate\Http\Response
    {
        $rateLimitResponse = $request->checkRateLimited();
        if ($rateLimitResponse) {
            return $rateLimitResponse;
        }

        $credentials = $request->validated();

        if (!Auth::validate($credentials)) {
            $request->hitRateLimiter();
            $this->logAttempt($request, false, 'invalid_credentials');

            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        $request->clearRateLimiter();

        $user = User::where('email', $credentials['email'])->first();

        // If user has 2FA enabled, redirect to challenge
        if ($user->hasTwoFactorEnabled()) {
            $request->session()->put('two_factor_user_id', $user->id);
            $this->logAttempt($request, true);

            return redirect()->route('two-factor.challenge');
        }

        // No 2FA - log in directly
        Auth::login($user);
        $request->session()->regenerate();
        $this->logAttempt($request, true);

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function logAttempt(Request $request, bool $successful, ?string $failureReason = null): void
    {
        LoginAttempt::create([
            'email' => $request->input('email'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'successful' => $successful,
            'failure_reason' => $failureReason,
        ]);
    }
}
