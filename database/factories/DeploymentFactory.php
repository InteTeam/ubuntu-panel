<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\App;
use App\Models\Deployment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Deployment>
 */
final class DeploymentFactory extends Factory
{
    protected $model = Deployment::class;

    public function definition(): array
    {
        return [
            'app_id' => App::factory(),
            'user_id' => User::factory(),
            'commit_hash' => fake()->sha1(),
            'commit_message' => fake()->sentence(),
            'branch' => 'main',
            'environment' => 'production',
            'status' => 'queued',
            'created_at' => now(),
        ];
    }

    public function running(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'running',
            'started_at' => now(),
        ]);
    }

    public function success(): static
    {
        $startedAt = now()->subMinutes(2);
        $finishedAt = now();

        return $this->state(fn (array $attributes) => [
            'status' => 'success',
            'started_at' => $startedAt,
            'finished_at' => $finishedAt,
            'duration_seconds' => $finishedAt->diffInSeconds($startedAt),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'started_at' => now()->subMinutes(1),
            'finished_at' => now(),
            'error_message' => 'Deployment failed: ' . fake()->sentence(),
        ]);
    }

    public function staging(): static
    {
        return $this->state(fn (array $attributes) => [
            'environment' => 'staging',
        ]);
    }

    public function rollback(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_rollback' => true,
        ]);
    }
}
