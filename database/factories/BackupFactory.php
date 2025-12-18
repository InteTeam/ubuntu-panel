<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\App;
use App\Models\Backup;
use App\Models\BackupDestination;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Backup>
 */
final class BackupFactory extends Factory
{
    protected $model = Backup::class;

    public function definition(): array
    {
        return [
            'app_id' => App::factory(),
            'destination_id' => BackupDestination::factory(),
            'schedule_id' => null,
            'type' => 'full',
            'status' => 'queued',
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
        return $this->state(fn (array $attributes) => [
            'status' => 'success',
            'started_at' => now()->subMinutes(5),
            'finished_at' => now(),
            'file_path' => '/backups/app_' . now()->format('Y-m-d_H-i-s') . '.tar.gz',
            'file_size_bytes' => fake()->numberBetween(1000000, 500000000),
            'checksum' => fake()->sha256(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'started_at' => now()->subMinutes(2),
            'finished_at' => now(),
            'error_message' => 'Backup failed: ' . fake()->sentence(),
        ]);
    }

    public function database(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'database',
        ]);
    }
}
