<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class TwoFactorChallengeController extends Controller
{
    public function __construct(
        private readonly TwoFactorService $twoFactorService,
    ) {}

    public function show(Request $request): Response|RedirectResponse
    {
        if (!$request->session()->has('two_factor_user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function store(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('two_factor_user_id');
        
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);

        if (!$user) {
            $request->session()->forget('two_factor_user_id');

            return redirect()->route('login');
        }

        $code = $request->input('code');
        $recoveryCode = $request->input('recovery_code');

        // Try TOTP code first
        if ($code) {
            $secret = $user->two_factor_secret; // Already decrypted by cast

            if ($this->twoFactorService->verify($secret, $code)) {
                return $this->loginUser($request, $user);
            }

            return back()->withErrors(['code' => 'The provided code is invalid.']);
        }

        // Try recovery code
        if ($recoveryCode) {
            $recoveryCodes = $user->recovery_codes ?? [];

            if (in_array($recoveryCode, $recoveryCodes, true)) {
                // Remove used recovery code
                $user->update([
                    'recovery_codes' => array_values(array_diff($recoveryCodes, [$recoveryCode])),
                ]);

                return $this->loginUser($request, $user);
            }

            return back()->withErrors(['recovery_code' => 'The provided recovery code is invalid.']);
        }

        return back()->withErrors(['code' => 'Please provide a verification code.']);
    }

    private function loginUser(Request $request, User $user): RedirectResponse
    {
        $request->session()->forget('two_factor_user_id');

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}
