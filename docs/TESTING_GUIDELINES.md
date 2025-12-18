# Testing Guidelines - UPanel

**Last Updated:** 2024-12-15  
**Framework:** Pest 4

---

## Test Structure

```
tests/
├── Feature/
│   ├── Auth/
│   │   ├── LoginTest.php
│   │   ├── TwoFactorTest.php
│   │   └── PasswordResetTest.php
│   ├── Servers/
│   │   ├── ServerListTest.php
│   │   ├── ServerCreateTest.php
│   │   └── ServerActionsTest.php
│   ├── Apps/
│   └── ...
├── Unit/
│   ├── Services/
│   │   ├── SshServiceTest.php
│   │   └── DeploymentServiceTest.php
│   └── ...
└── Pest.php
```

---

## Pest 4 Syntax

### Basic Test

```php
<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\Server;

test('admin can view servers list', function () {
    $user = User::factory()->admin()->create();
    
    $response = $this->actingAs($user)
        ->get(route('servers.index'));
    
    $response->assertOk();
});
```

### Test with Setup

```php
<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\Server;

beforeEach(function () {
    $this->user = User::factory()->admin()->create();
});

test('can view server details', function () {
    $server = Server::factory()->create();
    
    $response = $this->actingAs($this->user)
        ->get(route('servers.show', $server));
    
    $response->assertOk();
    $response->assertInertia(fn ($page) => 
        $page->component('Servers/Show')
            ->has('server')
    );
});

test('can create server', function () {
    $response = $this->actingAs($this->user)
        ->post(route('servers.store'), [
            'name' => 'Test Server',
            'host' => '192.168.1.100',
            'port' => 22,
        ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('servers', [
        'name' => 'Test Server',
        'host' => '192.168.1.100',
    ]);
});
```

---

## Test Categories

### Authentication Tests

```php
test('guest cannot access servers', function () {
    $response = $this->get(route('servers.index'));
    
    $response->assertRedirect(route('login'));
});

test('user without 2fa is redirected to setup', function () {
    $user = User::factory()->create([
        'two_factor_confirmed_at' => null,
    ]);
    
    $response = $this->actingAs($user)
        ->get(route('servers.index'));
    
    $response->assertRedirect(route('2fa.setup'));
});

test('admin with 2fa can access servers', function () {
    $user = User::factory()->admin()->twoFactorEnabled()->create();
    
    $response = $this->actingAs($user)
        ->get(route('servers.index'));
    
    $response->assertOk();
});
```

### CRUD Tests

```php
test('can create server with valid data', function () {
    $user = User::factory()->admin()->twoFactorEnabled()->create();
    
    $response = $this->actingAs($user)
        ->post(route('servers.store'), [
            'name' => 'Production',
            'host' => '10.0.0.1',
            'port' => 22,
        ]);
    
    $response->assertRedirect();
    $response->assertSessionHas('alert', 'The server was created successfully.');
    
    $this->assertDatabaseHas('servers', [
        'name' => 'Production',
        'host' => '10.0.0.1',
        'status' => 'pending',
    ]);
});

test('cannot create server with invalid data', function () {
    $user = User::factory()->admin()->twoFactorEnabled()->create();
    
    $response = $this->actingAs($user)
        ->post(route('servers.store'), [
            'name' => '',  // Required
            'host' => '',  // Required
        ]);
    
    $response->assertSessionHasErrors(['name', 'host']);
});

test('can update server', function () {
    $user = User::factory()->admin()->twoFactorEnabled()->create();
    $server = Server::factory()->create();
    
    $response = $this->actingAs($user)
        ->put(route('servers.update', $server), [
            'name' => 'Updated Name',
            'host' => $server->host,
        ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('servers', [
        'id' => $server->id,
        'name' => 'Updated Name',
    ]);
});

test('can delete server', function () {
    $user = User::factory()->admin()->twoFactorEnabled()->create();
    $server = Server::factory()->create();
    
    $response = $this->actingAs($user)
        ->delete(route('servers.destroy', $server));
    
    $response->assertRedirect();
    $this->assertDatabaseMissing('servers', ['id' => $server->id]);
});
```

### SSH Mock Tests

```php
use App\Services\SshService;

test('test connection returns success when server is reachable', function () {
    $user = User::factory()->admin()->twoFactorEnabled()->create();
    $server = Server::factory()->create();
    
    // Mock SSH service
    $this->mock(SshService::class, function ($mock) {
        $mock->shouldReceive('testConnection')
            ->once()
            ->andReturn(true);
    });
    
    $response = $this->actingAs($user)
        ->post(route('servers.test-connection', $server));
    
    $response->assertJson(['success' => true]);
});

test('test connection returns error when server unreachable', function () {
    $user = User::factory()->admin()->twoFactorEnabled()->create();
    $server = Server::factory()->create();
    
    $this->mock(SshService::class, function ($mock) {
        $mock->shouldReceive('testConnection')
            ->once()
            ->andThrow(new \App\Exceptions\SshConnectionException('Connection refused'));
    });
    
    $response = $this->actingAs($user)
        ->post(route('servers.test-connection', $server));
    
    $response->assertJson([
        'success' => false,
        'error' => 'Connection refused',
    ]);
});
```

### Deployment Tests

```php
use App\Jobs\DeployAppJob;
use Illuminate\Support\Facades\Queue;

test('deployment job is dispatched', function () {
    Queue::fake();
    
    $user = User::factory()->admin()->twoFactorEnabled()->create();
    $app = App::factory()->create();
    
    $response = $this->actingAs($user)
        ->post(route('apps.deployments.store', $app), [
            'branch' => 'main',
            'environment' => 'production',
        ]);
    
    $response->assertRedirect();
    Queue::assertPushed(DeployAppJob::class);
});

test('deployment creates record with correct status', function () {
    Queue::fake();
    
    $user = User::factory()->admin()->twoFactorEnabled()->create();
    $app = App::factory()->create();
    
    $this->actingAs($user)
        ->post(route('apps.deployments.store', $app), [
            'branch' => 'main',
            'environment' => 'production',
        ]);
    
    $this->assertDatabaseHas('deployments', [
        'app_id' => $app->id,
        'user_id' => $user->id,
        'branch' => 'main',
        'environment' => 'production',
        'status' => 'queued',
    ]);
});
```

---

## Factories

### User Factory

```php
<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

final class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'role' => 'admin',
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    public function twoFactorEnabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => encrypt('JBSWY3DPEHPK3PXP'),
            'two_factor_confirmed_at' => now(),
            'recovery_codes' => encrypt(json_encode([
                'code1', 'code2', 'code3', 'code4', 'code5',
            ])),
        ]);
    }
}
```

### Server Factory

```php
<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

final class ServerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true) . ' Server',
            'host' => fake()->ipv4(),
            'port' => 22,
            'username' => 'upanel',
            'ssh_private_key' => encrypt('fake-private-key'),
            'ssh_public_key' => 'ssh-ed25519 AAAA... fake@key',
            'status' => 'online',
            'last_seen_at' => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'last_seen_at' => null,
        ]);
    }

    public function offline(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'offline',
            'last_seen_at' => now()->subMinutes(10),
        ]);
    }
}
```

---

## Running Tests

```bash
# All tests
docker compose exec app php artisan test

# Specific test file
docker compose exec app php artisan test --filter=ServerTest

# Specific test
docker compose exec app php artisan test --filter="can create server"

# With coverage
docker compose exec app php artisan test --coverage --min=80

# Parallel (faster)
docker compose exec app php artisan test --parallel
```

---

## Test Rules

### DO

- ✅ Use Pest 4 functional syntax
- ✅ Use factories for test data
- ✅ Mock external services (SSH, APIs)
- ✅ Test auth + authorization first
- ✅ Test happy path + error cases
- ✅ Use `RefreshDatabase` trait
- ✅ Assert flash messages
- ✅ Assert database state

### DON'T

- ❌ Use PHPUnit classes
- ❌ Use seeders for test data
- ❌ Make real SSH connections
- ❌ Skip authorization tests
- ❌ Only test happy path
- ❌ Share state between tests

---

## Coverage Requirements

| Area | Minimum |
|------|---------|
| Controllers | 80% |
| Services | 90% |
| Models | 70% |
| Overall | 80% |

---

## Feature-by-Feature Testing

Test one feature at a time, in order:

```bash
# 1. Auth first
php artisan test --filter=Auth

# 2. Then servers
php artisan test --filter=Server

# 3. Then apps
php artisan test --filter=App

# 4. Then deployments
php artisan test --filter=Deployment

# 5. Full suite only at end
php artisan test
```

Don't move to next feature until current passes 100%.
