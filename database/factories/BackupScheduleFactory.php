<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\App;
use App\Models\BackupDestination;
use App\Models\BackupSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BackupSchedule>
 */
final class BackupScheduleFactory extends Factory
{
    protected $model = BackupSchedule::class;

    public function definition(): array
    {
        return [
            'app_id' => App::factory(),
            'destination_id' => BackupDestination::factory(),
            'name' => fake()->words(2, true) . ' Schedule',
            'type' => 'full',
            'cron_expression' => '0 2 * * *',
            'retention_count' => 7,
            'is_active' => true,
            'next_run_at' => now()->addDay()->setTime(2, 0),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function weekly(): static
    {
        return $this->state(fn (array $attributes) => [
            'cron_expression' => '0 2 * * 0',
            'retention_count' => 4,
        ]);
    }

    public function hourly(): static
    {
        return $this->state(fn (array $attributes) => [
            'cron_expression' => '0 * * * *',
            'retention_count' => 24,
        ]);
    }
}
