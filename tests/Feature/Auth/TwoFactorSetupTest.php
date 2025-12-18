<?php

declare(strict_types=1);

use App\Models\User;
use PragmaRX\Google2FA\Google2FA;

test('user without 2fa is redirected to setup after login', function () {
    $user = User::factory()->create([
        'two_factor_secret' => null,
        'two_factor_confirmed_at' => null,
    ]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect('/two-factor/setup');
});

test('2fa setup page shows qr code', function () {
    $user = User::factory()->create([
        'two_factor_secret' => null,
        'two_factor_confirmed_at' => null,
    ]);

    $response = $this->actingAs($user)->get('/two-factor/setup');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Auth/TwoFactorSetup')
        ->has('qrCode')
        ->has('secret')
    );
});

test('2fa setup stores secret when confirmed with valid code', function () {
    $google2fa = new Google2FA();
    $secret = $google2fa->generateSecretKey();
    
    $user = User::factory()->create([
        'two_factor_secret' => $secret, // Cast handles encryption
        'two_factor_confirmed_at' => null,
    ]);

    $validCode = $google2fa->getCurrentOtp($secret);

    $response = $this->actingAs($user)->post('/two-factor/confirm', [
        'code' => $validCode,
    ]);

    $response->assertRedirect('/dashboard');
    
    $user->refresh();
    expect($user->two_factor_confirmed_at)->not->toBeNull();
    expect($user->recovery_codes)->toHaveCount(8);
});

test('2fa setup fails with invalid code', function () {
    $user = User::factory()->create([
        'two_factor_secret' => 'JBSWY3DPEHPK3PXP', // Cast handles encryption
        'two_factor_confirmed_at' => null,
    ]);

    $response = $this->actingAs($user)->post('/two-factor/confirm', [
        'code' => '000000',
    ]);

    $response->assertSessionHasErrors('code');
    
    $user->refresh();
    expect($user->two_factor_confirmed_at)->toBeNull();
});

test('user with confirmed 2fa can access dashboard', function () {
    $user = User::factory()->twoFactorEnabled()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
});
