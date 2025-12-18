<?php

declare(strict_types=1);

use App\Models\User;
use PragmaRX\Google2FA\Google2FA;

test('user with 2fa enabled must verify code after login', function () {
    $user = User::factory()->twoFactorEnabled()->create([
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $response = $this->post('/login', [
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $response->assertRedirect('/two-factor/challenge');
    $this->assertGuest(); // Not fully authenticated yet
});

test('2fa challenge validates correct code', function () {
    $google2fa = new Google2FA();
    $secret = 'JBSWY3DPEHPK3PXP';
    
    $user = User::factory()->create([
        'two_factor_secret' => $secret, // Cast handles encryption
        'two_factor_confirmed_at' => now(),
        'recovery_codes' => ['code1-code1', 'code2-code2'],
    ]);

    // Simulate pending 2FA session
    session(['two_factor_user_id' => $user->id]);

    $validCode = $google2fa->getCurrentOtp($secret);

    $response = $this->post('/two-factor/challenge', [
        'code' => $validCode,
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($user);
});

test('2fa challenge rejects invalid code', function () {
    $user = User::factory()->twoFactorEnabled()->create();

    session(['two_factor_user_id' => $user->id]);

    $response = $this->post('/two-factor/challenge', [
        'code' => '000000',
    ]);

    $response->assertSessionHasErrors('code');
    $this->assertGuest();
});

test('recovery code can be used for 2fa', function () {
    $recoveryCodes = ['abc12-def34', 'ghi56-jkl78', 'mno90-pqr12'];
    
    $user = User::factory()->create([
        'two_factor_secret' => 'JBSWY3DPEHPK3PXP', // Cast handles encryption
        'two_factor_confirmed_at' => now(),
        'recovery_codes' => $recoveryCodes,
    ]);

    session(['two_factor_user_id' => $user->id]);

    $response = $this->post('/two-factor/challenge', [
        'code' => '',
        'recovery_code' => 'abc12-def34',
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($user);
    
    // Recovery code should be consumed
    $user->refresh();
    expect($user->recovery_codes)->not->toContain('abc12-def34');
    expect($user->recovery_codes)->toHaveCount(2);
});

test('recovery code can only be used once', function () {
    $recoveryCodes = ['abc12-def34', 'ghi56-jkl78'];
    
    $user = User::factory()->create([
        'two_factor_secret' => 'JBSWY3DPEHPK3PXP', // Cast handles encryption
        'two_factor_confirmed_at' => now(),
        'recovery_codes' => $recoveryCodes,
    ]);

    session(['two_factor_user_id' => $user->id]);

    // First use - should work
    $this->post('/two-factor/challenge', [
        'code' => '',
        'recovery_code' => 'abc12-def34',
    ]);

    auth()->logout();
    session(['two_factor_user_id' => $user->id]);

    // Second use - should fail
    $response = $this->post('/two-factor/challenge', [
        'code' => '',
        'recovery_code' => 'abc12-def34',
    ]);

    $response->assertSessionHasErrors('recovery_code');
});
