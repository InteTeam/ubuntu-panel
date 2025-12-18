# Migration: 004_create_login_attempts_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_login_attempts_table.php`  
**Status:** Pending

---

## Purpose

Audit trail for login attempts (successful and failed) for security monitoring.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| email | VARCHAR(255) | NO | - | Attempted email |
| ip_address | VARCHAR(45) | NO | - | Client IP |
| user_agent | TEXT | YES | NULL | Browser info |
| successful | BOOLEAN | NO | FALSE | Login succeeded |
| failure_reason | VARCHAR(50) | YES | NULL | Why it failed |
| created_at | TIMESTAMP | NO | NOW | Attempt time |

---

## Failure Reasons

| Value | Meaning |
|-------|---------|
| `invalid_credentials` | Wrong email or password |
| `user_not_found` | Email doesn't exist |
| `account_locked` | Too many failures |
| `2fa_failed` | Invalid TOTP code |
| `2fa_required` | 2FA not completed |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| PRIMARY | id | Primary key |
| idx_email_created | email, created_at DESC | Rate limiting lookup |
| idx_ip_created | ip_address, created_at DESC | IP-based rate limiting |
| idx_successful | successful | Filter by outcome |

---

## Migration Code

```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('login_attempts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('email');
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->boolean('successful')->default(false);
            $table->string('failure_reason', 50)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['email', 'created_at']);
            $table->index(['ip_address', 'created_at']);
            $table->index('successful');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_attempts');
    }
};
```

---

## Rate Limiting Query

```php
// Check failed attempts in last 15 minutes
$recentFailures = LoginAttempt::query()
    ->where('email', $email)
    ->where('successful', false)
    ->where('created_at', '>', now()->subMinutes(15))
    ->count();

if ($recentFailures >= 5) {
    throw new TooManyLoginAttemptsException();
}
```

---

## Cleanup

```php
// Scheduled job: delete attempts older than 30 days
LoginAttempt::where('created_at', '<', now()->subDays(30))->delete();
```
