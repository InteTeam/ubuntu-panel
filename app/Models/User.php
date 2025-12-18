<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

final class User extends Authenticatable
{
    use HasFactory;
    use HasUlids;
    use Notifiable;

    protected $fillable = [
        'email',
        'password',
        'two_factor_secret',
        'two_factor_confirmed_at',
        'recovery_codes',
        'role',
        'timezone',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'two_factor_secret' => 'encrypted',
            'two_factor_confirmed_at' => 'datetime',
            'recovery_codes' => 'encrypted:array',
            'password' => 'hashed',
        ];
    }

    public function hasTwoFactorEnabled(): bool
    {
        return $this->two_factor_confirmed_at !== null;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
