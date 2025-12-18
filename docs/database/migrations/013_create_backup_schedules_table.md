# Migration: 013_create_backup_schedules_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_backup_schedules_table.php`  
**Status:** Pending

---

## Purpose

Define automated backup schedules with cron expressions.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| app_id | CHAR(26) | NO | - | App reference |
| backup_destination_id | CHAR(26) | NO | - | Destination |
| type | ENUM | NO | - | database/files/full |
| cron_expression | VARCHAR(100) | NO | - | Schedule |
| timezone | VARCHAR(50) | NO | UTC | Schedule TZ |
| retention_count | INT | NO | 7 | Keep N backups |
| is_active | BOOLEAN | NO | TRUE | Schedule active |
| last_run_at | TIMESTAMP | YES | NULL | Last execution |
| next_run_at | TIMESTAMP | YES | NULL | Next execution |
| created_at | TIMESTAMP | NO | NOW | Created |
| updated_at | TIMESTAMP | NO | NOW | Updated |

---

## Cron Examples

| Expression | Meaning |
|------------|---------|
| `0 2 * * *` | Daily at 2:00 AM |
| `0 3 * * 0` | Weekly on Sunday at 3:00 AM |
| `0 4 1 * *` | Monthly on 1st at 4:00 AM |
| `0 */6 * * *` | Every 6 hours |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| idx_next_run | next_run_at | Scheduler query |
| idx_active | is_active | Active schedules |

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
        Schema::create('backup_schedules', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('app_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('backup_destination_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['database', 'files', 'full']);
            $table->string('cron_expression', 100);
            $table->string('timezone', 50)->default('UTC');
            $table->unsignedInteger('retention_count')->default(7);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            $table->timestamps();

            $table->index('next_run_at');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backup_schedules');
    }
};
```

---

## Scheduler Job

```php
// Check every minute for due schedules
BackupSchedule::query()
    ->where('is_active', true)
    ->where('next_run_at', '<=', now())
    ->each(function ($schedule) {
        RunScheduledBackupJob::dispatch($schedule);
        $schedule->updateNextRun();
    });
```
