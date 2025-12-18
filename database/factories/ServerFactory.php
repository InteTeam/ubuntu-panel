<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Server;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Server>
 */
final class ServerFactory extends Factory
{
    protected $model = Server::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true) . ' Server',
            'host' => fake()->ipv4(),
            'port' => 22,
            'username' => 'upanel',
            'ssh_private_key' => 'fake-private-key',
            'ssh_public_key' => 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFake upanel@panel',
            'agent_token' => null,
            'agent_port' => 8443,
            'status' => 'pending',
        ];
    }

    public function online(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'online',
            'last_seen_at' => now(),
            'os_version' => 'Ubuntu 24.04 LTS',
            'cpu_cores' => fake()->numberBetween(2, 16),
            'ram_mb' => fake()->randomElement([2048, 4096, 8192, 16384]),
            'disk_gb' => fake()->randomElement([50, 100, 200, 500]),
        ]);
    }

    public function offline(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'offline',
            'last_seen_at' => now()->subMinutes(10),
        ]);
    }

    public function withAgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'agent_token' => hash('sha256', Str::random(32)),
        ]);
    }
}
