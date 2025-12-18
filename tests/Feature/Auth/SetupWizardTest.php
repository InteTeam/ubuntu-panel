<?php

declare(strict_types=1);

use App\Models\User;

test('guest is redirected to login', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect('/login');
});

test('guest is redirected to setup wizard when no users exist', function () {
    $response = $this->get('/login');

    $response->assertRedirect('/setup');
});

test('setup wizard creates admin user', function () {
    $response = $this->post('/setup', [
        'email' => 'admin@example.com',
        'password' => 'SecurePassword123!',
        'password_confirmation' => 'SecurePassword123!',
    ]);

    $response->assertRedirect('/login');
    
    $this->assertDatabaseHas('users', [
        'email' => 'admin@example.com',
        'role' => 'admin',
    ]);
});

test('setup wizard is blocked when user already exists', function () {
    User::factory()->create();

    $response = $this->get('/setup');

    $response->assertRedirect('/login');
});

test('setup wizard validates required fields', function () {
    $response = $this->post('/setup', []);

    $response->assertSessionHasErrors(['email', 'password']);
});

test('setup wizard validates password confirmation', function () {
    $response = $this->post('/setup', [
        'email' => 'admin@example.com',
        'password' => 'SecurePassword123!',
        'password_confirmation' => 'DifferentPassword!',
    ]);

    $response->assertSessionHasErrors(['password']);
});
