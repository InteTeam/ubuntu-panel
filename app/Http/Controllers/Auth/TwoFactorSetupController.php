<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TwoFactorSetupController extends Controller
{
    public function __construct(
        private readonly TwoFactorService $twoFactorService,
    ) {}

    public function show(Request $request): Response
    {
        $user = $request->user();
        
        // Generate new secret if not exists
        if (!$user->two_factor_secret) {
            $secret = $this->twoFactorService->generateSecret();
            $user->update(['two_factor_secret' => $secret]);
        } else {
            $secret = $user->two_factor_secret; // Already decrypted by cast
        }

        return Inertia::render('Auth/TwoFactorSetup', [
            'qrCode' => $this->twoFactorService->getQrCodeSvg($user->email, $secret),
            'secret' => $secret,
        ]);
    }

    public function confirm(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        $secret = $user->two_factor_secret; // Already decrypted by cast

        if (!$this->twoFactorService->verify($secret, $request->input('code'))) {
            return back()->withErrors(['code' => 'The provided code is invalid.']);
        }

        $user->update([
            'two_factor_confirmed_at' => now(),
            'recovery_codes' => $this->twoFactorService->generateRecoveryCodes(),
        ]);

        return redirect()
            ->route('dashboard')
            ->with(['alert' => 'Two-factor authentication enabled.', 'type' => 'success']);
    }
}
