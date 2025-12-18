<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SetupRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class SetupController extends Controller
{
    public function show(): Response|RedirectResponse
    {
        if (User::exists()) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/Setup');
    }

    public function store(SetupRequest $request): RedirectResponse
    {
        if (User::exists()) {
            return redirect()->route('login');
        }

        User::create([
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'role' => 'admin',
        ]);

        return redirect()
            ->route('login')
            ->with(['alert' => 'Admin account created. Please log in.', 'type' => 'success']);
    }
}
