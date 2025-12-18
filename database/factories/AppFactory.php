<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\App;
use App\Models\Server;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<App>
 */
final class AppFactory extends Factory
{
    protected $model = App::class;

    public function definition(): array
    {
        return [
            'server_id' => Server::factory(),
            'name' => fake()->words(2, true) . ' App',
            'git_repository' => 'https://github.com/' . fake()->userName() . '/' . fake()->slug(2) . '.git',
            'git_branch' => 'main',
            'git_credentials_id' => null,
            'deploy_path' => '/home/upanel/apps/' . fake()->slug(2),
            'docker_compose_file' => 'docker-compose.yml',
            'env_vars' => null,
            'env_production' => ['APP_ENV' => 'production'],
            'env_staging' => ['APP_ENV' => 'staging'],
            'status' => 'pending',
        ];
    }

    public function running(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'running',
            'current_commit' => fake()->sha1(),
        ]);
    }

    public function deploying(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'deploying',
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
        ]);
    }
}
