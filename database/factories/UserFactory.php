<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
final class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
            'role' => 'admin',
            'timezone' => 'UTC',
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    public function operator(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'operator',
        ]);
    }

    public function viewer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'viewer',
        ]);
    }

    public function twoFactorEnabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => 'JBSWY3DPEHPK3PXP', // Cast handles encryption
            'two_factor_confirmed_at' => now(),
            'recovery_codes' => [
                'code1-code1',
                'code2-code2',
                'code3-code3',
                'code4-code4',
                'code5-code5',
                'code6-code6',
                'code7-code7',
                'code8-code8',
            ],
        ]);
    }
}
