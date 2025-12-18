# Migration: 014_create_security_events_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_security_events_table.php`  
**Status:** Pending

---

## Purpose

Audit log for security-relevant events.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| user_id | CHAR(26) | YES | NULL | User involved |
| server_id | CHAR(26) | YES | NULL | Server involved |
| event_type | VARCHAR(50) | NO | - | Event type |
| severity | ENUM | NO | info | Event severity |
| ip_address | VARCHAR(45) | YES | NULL | Client IP |
| user_agent | TEXT | YES | NULL | Browser info |
| details | JSON | YES | NULL | Event data |
| created_at | TIMESTAMP | NO | NOW | Event time |

---

## Event Types

| Type | Severity | Description |
|------|----------|-------------|
| login_success | info | Successful login |
| login_failed | warning | Failed login attempt |
| 2fa_enabled | info | 2FA setup complete |
| 2fa_disabled | warning | 2FA disabled |
| password_reset | info | Password changed |
| session_invalidated | info | Session ended |
| rate_limit_hit | warning | Rate limit triggered |
| emergency_access | critical | Emergency bypass used |
| server_added | info | New server registered |
| server_deleted | warning | Server removed |
| agent_token_rotated | info | Agent token changed |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| idx_type_created | event_type, created_at DESC | Event history |
| idx_severity | severity | Filter critical |
| idx_user | user_id | User audit |

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
        Schema::create('security_events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('server_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_type', 50);
            $table->enum('severity', ['info', 'warning', 'critical'])->default('info');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('details')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['event_type', 'created_at']);
            $table->index('severity');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_events');
    }
};
```

---

## Usage

```php
SecurityEvent::create([
    'user_id' => auth()->id(),
    'event_type' => 'login_success',
    'severity' => 'info',
    'ip_address' => request()->ip(),
    'user_agent' => request()->userAgent(),
    'details' => ['method' => '2fa'],
]);
```
