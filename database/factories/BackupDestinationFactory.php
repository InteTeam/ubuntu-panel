<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BackupDestination;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BackupDestination>
 */
final class BackupDestinationFactory extends Factory
{
    protected $model = BackupDestination::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true) . ' Backup',
            'type' => 'local',
            'credentials' => ['path' => '/backups'],
            'is_default' => false,
        ];
    }

    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }

    public function sftp(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'sftp',
            'credentials' => [
                'host' => fake()->ipv4(),
                'port' => 22,
                'username' => 'backup',
                'private_key' => 'fake-key',
                'path' => '/backups',
            ],
        ]);
    }

    public function b2(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'b2',
            'credentials' => [
                'bucket' => 'my-backup-bucket',
                'key_id' => fake()->uuid(),
                'app_key' => fake()->sha256(),
                'path' => '/backups',
            ],
        ]);
    }

    public function googleDrive(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'google_drive',
            'credentials' => [
                'folder_id' => fake()->regexify('[A-Za-z0-9]{33}'),
            ],
        ]);
    }
}
