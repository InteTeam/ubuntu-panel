<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\GitCredential;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GitCredential>
 */
final class GitCredentialFactory extends Factory
{
    protected $model = GitCredential::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true) . ' Credentials',
            'type' => 'token',
            'credentials' => [
                'token' => 'ghp_' . fake()->regexify('[A-Za-z0-9]{36}'),
            ],
        ];
    }

    public function sshKey(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'ssh_key',
            'credentials' => [
                'private_key' => 'fake-ssh-private-key',
            ],
        ]);
    }

    public function basic(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'basic',
            'credentials' => [
                'username' => fake()->userName(),
                'password' => fake()->password(),
            ],
        ]);
    }
}
