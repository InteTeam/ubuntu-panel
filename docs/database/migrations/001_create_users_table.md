# Migration: 001_create_users_table

**File:** `database/migrations/YYYY_MM_DD_000001_create_users_table.php`  
**Status:** Pending

---

## Purpose

Store admin user accounts with 2FA support.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| email | VARCHAR(255) | NO | - | Unique email |
| password | VARCHAR(255) | NO | - | Hashed password |
| two_factor_secret | TEXT | YES | NULL | Encrypted TOTP secret |
| two_factor_confirmed_at | TIMESTAMP | YES | NULL | When 2FA was confirmed |
| recovery_codes | TEXT | YES | NULL | Encrypted JSON array |
| role | ENUM | NO | 'admin' | admin, operator, viewer |
| timezone | VARCHAR(50) | NO | 'UTC' | User timezone |
| created_at | TIMESTAMP | NO | NOW | Record creation |
| updated_at | TIMESTAMP | NO | NOW | Last update |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| PRIMARY | id | Primary key |
| users_email_unique | email | Unique constraint |

---

## Model Configuration

```php
<?php

declare(strict_types=1);

namespace App\Models;

use App\Policies\UserPolicy;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Foundation\Auth\User as Authenticatable;

#[UsePolicy(UserPolicy::class)]
final class User extends Authenticatable
{
    use HasUlids;

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
}
```

---

## Related

- Feature: [/docs/features/authentication/README.md]
- Full schema: [/docs/08-database-schema.md]
