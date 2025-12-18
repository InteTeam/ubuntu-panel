# Migration: 002_create_sessions_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_sessions_table.php`  
**Status:** Pending

---

## Purpose

Store user sessions in database for better security control (invalidation, single-session enforcement).

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | VARCHAR(255) | NO | - | Session ID (Laravel generated) |
| user_id | CHAR(26) | YES | NULL | Authenticated user (null for guests) |
| ip_address | VARCHAR(45) | YES | NULL | Client IP |
| user_agent | TEXT | YES | NULL | Browser/client info |
| payload | LONGTEXT | NO | - | Serialized session data |
| last_activity | INT | NO | - | Unix timestamp |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| PRIMARY | id | Primary key |
| sessions_user_id_index | user_id | Find user sessions |
| sessions_last_activity_index | last_activity | Cleanup old sessions |

---

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| user_id | users(id) | CASCADE |

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
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUlid('user_id')->nullable()->index()->constrained()->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
```

---

## Notes

- Laravel's default session table structure
- `user_id` nullable for guest sessions
- No timestamps (uses last_activity instead)
- Cleanup via `php artisan session:gc`
