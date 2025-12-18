<?php

declare(strict_types=1);

use App\Models\User;

test('login is rate limited after 5 failed attempts', function () {
    User::factory()->create([
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    // Make 5 failed attempts
    for ($i = 0; $i < 5; $i++) {
        $this->post('/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);
    }

    // 6th attempt should be rate limited
    $response = $this->post('/login', [
        'email' => 'admin@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(429);
});

test('rate limit is per email address', function () {
    User::factory()->create(['email' => 'admin@example.com', 'password' => 'password']);
    User::factory()->create(['email' => 'other@example.com', 'password' => 'password']);

    // Make 5 failed attempts for first email
    for ($i = 0; $i < 5; $i++) {
        $this->post('/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);
    }

    // Should still be able to try with different email
    $response = $this->post('/login', [
        'email' => 'other@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(302); // Redirect, not 429
});

test('successful login resets rate limit', function () {
    User::factory()->create([
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    // Make 4 failed attempts
    for ($i = 0; $i < 4; $i++) {
        $this->post('/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);
    }

    // Successful login
    $this->post('/login', [
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $this->post('/logout');

    // Should be able to try again (rate limit reset)
    for ($i = 0; $i < 4; $i++) {
        $response = $this->post('/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);
        
        $response->assertStatus(302); // Not rate limited
    }
});
