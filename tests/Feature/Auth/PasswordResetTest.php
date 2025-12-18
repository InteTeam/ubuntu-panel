<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

test('password reset link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create(['email' => 'admin@example.com']);

    $response = $this->post('/forgot-password', [
        'email' => 'admin@example.com',
    ]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('password reset link is not sent for non-existent email', function () {
    Notification::fake();

    $response = $this->post('/forgot-password', [
        'email' => 'nonexistent@example.com',
    ]);

    Notification::assertNothingSent();
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create(['email' => 'admin@example.com']);

    $this->post('/forgot-password', ['email' => 'admin@example.com']);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->post('/reset-password', [
            'token' => $notification->token,
            'email' => 'admin@example.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertSessionHasNoErrors();

        return true;
    });
});

test('password reset fails with invalid token', function () {
    $user = User::factory()->create(['email' => 'admin@example.com']);

    $response = $this->post('/reset-password', [
        'token' => 'invalid-token',
        'email' => 'admin@example.com',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ]);

    $response->assertSessionHasErrors();
});

test('password reset token expires after 60 minutes', function () {
    $user = User::factory()->create(['email' => 'admin@example.com']);

    // Create expired token
    $token = Password::broker()->createToken($user);

    // Travel forward 61 minutes
    $this->travel(61)->minutes();

    $response = $this->post('/reset-password', [
        'token' => $token,
        'email' => 'admin@example.com',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ]);

    $response->assertSessionHasErrors();
});
