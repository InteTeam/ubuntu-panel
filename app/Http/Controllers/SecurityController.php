<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\LoginAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SecurityController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Security/Index', [
            'loginAttempts' => LoginAttempt::query()
                ->where('email', $user->email)
                ->orderByDesc('created_at')
                ->limit(20)
                ->get(),
            'twoFactorEnabled' => $user->hasTwoFactorEnabled(),
            'sessions' => $this->getActiveSessions($request),
        ]);
    }

    private function getActiveSessions(Request $request): array
    {
        $sessions = \DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('last_activity')
            ->get();

        return $sessions->map(function ($session) use ($request) {
            return [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'user_agent' => $session->user_agent,
                'last_activity' => \Carbon\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                'is_current' => $session->id === $request->session()->getId(),
            ];
        })->toArray();
    }
}
