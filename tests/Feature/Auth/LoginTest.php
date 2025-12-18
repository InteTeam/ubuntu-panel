<?php

declare(strict_types=1);

use App\Models\User;

test('login page is displayed', function () {
    User::factory()->create();

    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('user can login with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $response = $this->post('/login', [
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
});

test('user cannot login with wrong password', function () {
    $user = User::factory()->create([
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $response = $this->post('/login', [
        'email' => 'admin@example.com',
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('user cannot login with non-existent email', function () {
    $response = $this->post('/login', [
        'email' => 'nonexistent@example.com',
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('login attempt is logged', function () {
    $user = User::factory()->create([
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $this->post('/login', [
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $this->assertDatabaseHas('login_attempts', [
        'email' => 'admin@example.com',
        'successful' => true,
    ]);
});

test('failed login attempt is logged', function () {
    $user = User::factory()->create([
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $this->post('/login', [
        'email' => 'admin@example.com',
        'password' => 'wrong-password',
    ]);

    $this->assertDatabaseHas('login_attempts', [
        'email' => 'admin@example.com',
        'successful' => false,
        'failure_reason' => 'invalid_credentials',
    ]);
});

test('user can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/login');
});
