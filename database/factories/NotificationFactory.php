<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
final class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        $types = ['deployment', 'backup', 'server', 'system'];
        $type = fake()->randomElement($types);

        return [
            'user_id' => User::factory(),
            'type' => $type,
            'title' => $this->getTitleForType($type),
            'message' => fake()->sentence(),
            'data' => [],
            'read_at' => null,
        ];
    }

    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'read_at' => now()->subHours(fake()->numberBetween(1, 24)),
        ]);
    }

    public function deployment(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'deployment',
            'title' => fake()->randomElement(['Deployment Started', 'Deployment Successful', 'Deployment Failed']),
        ]);
    }

    public function backup(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'backup',
            'title' => fake()->randomElement(['Backup Completed', 'Backup Failed']),
        ]);
    }

    public function server(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'server',
            'title' => fake()->randomElement(['Server Offline', 'Server Online', 'High CPU Usage']),
        ]);
    }

    private function getTitleForType(string $type): string
    {
        return match ($type) {
            'deployment' => fake()->randomElement(['Deployment Started', 'Deployment Successful', 'Deployment Failed']),
            'backup' => fake()->randomElement(['Backup Completed', 'Backup Failed']),
            'server' => fake()->randomElement(['Server Offline', 'Server Online']),
            default => 'System Notification',
        };
    }
}
