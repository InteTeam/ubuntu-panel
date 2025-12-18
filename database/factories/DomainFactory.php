<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\App;
use App\Models\Domain;
use App\Models\Server;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Domain>
 */
final class DomainFactory extends Factory
{
    protected $model = Domain::class;

    public function definition(): array
    {
        return [
            'app_id' => App::factory(),
            'server_id' => Server::factory(),
            'domain' => fake()->unique()->domainName(),
            'environment' => 'production',
            'ssl_enabled' => true,
            'ssl_auto_renew' => true,
            'upstream_port' => 3000,
            'status' => 'pending',
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'caddy_configured' => true,
            'ssl_expires_at' => now()->addMonths(3),
        ]);
    }

    public function staging(): static
    {
        return $this->state(fn (array $attributes) => [
            'environment' => 'staging',
        ]);
    }
}
