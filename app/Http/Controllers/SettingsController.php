<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

final class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/Index', [
            'user' => $request->user()->only(['id', 'email', 'timezone', 'email_notifications', 'role']),
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $request->user()->id],
            'timezone' => ['required', 'string', 'max:50'],
            'email_notifications' => ['boolean'],
        ]);

        $request->user()->update($request->only(['email', 'timezone', 'email_notifications']));

        return back()->with(['alert' => 'Profile updated.', 'type' => 'success']);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->input('password')),
        ]);

        return back()->with(['alert' => 'Password updated.', 'type' => 'success']);
    }
}
