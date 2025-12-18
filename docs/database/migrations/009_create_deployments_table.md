# Migration: 009_create_deployments_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_deployments_table.php`  
**Status:** Pending

---

## Purpose

Track deployment history with logs and rollback support.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| app_id | CHAR(26) | NO | - | App reference |
| user_id | CHAR(26) | YES | NULL | Who triggered |
| commit_hash | VARCHAR(40) | NO | - | Git commit |
| commit_message | TEXT | YES | NULL | Commit message |
| branch | VARCHAR(100) | NO | - | Deployed branch |
| environment | ENUM | NO | - | production/staging |
| status | ENUM | NO | queued | Deployment status |
| started_at | TIMESTAMP | YES | NULL | Start time |
| finished_at | TIMESTAMP | YES | NULL | End time |
| duration_seconds | INT | YES | NULL | Total duration |
| log | TEXT | YES | NULL | Deployment output |
| error_message | TEXT | YES | NULL | Error if failed |
| is_rollback | BOOLEAN | NO | FALSE | Is rollback deploy |
| rollback_from_id | CHAR(26) | YES | NULL | Original deployment |
| created_at | TIMESTAMP | NO | NOW | Created |

---

## Status Values

| Status | Meaning |
|--------|---------|
| queued | Waiting in queue |
| running | In progress |
| success | Completed successfully |
| failed | Deployment failed |
| cancelled | Manually cancelled |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| idx_app_created | app_id, created_at DESC | App deployment history |
| idx_status | status | Filter by status |

---

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| app_id | apps(id) | CASCADE |
| user_id | users(id) | SET NULL |
| rollback_from_id | deployments(id) | SET NULL |

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
        Schema::create('deployments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('app_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('commit_hash', 40);
            $table->text('commit_message')->nullable();
            $table->string('branch', 100);
            $table->enum('environment', ['production', 'staging']);
            $table->enum('status', ['queued', 'running', 'success', 'failed', 'cancelled'])->default('queued');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->text('log')->nullable();
            $table->text('error_message')->nullable();
            $table->boolean('is_rollback')->default(false);
            $table->foreignUlid('rollback_from_id')->nullable()->constrained('deployments')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['app_id', 'created_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deployments');
    }
};
```
