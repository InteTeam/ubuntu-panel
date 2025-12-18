# Migration: 012_create_backups_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_backups_table.php`  
**Status:** Pending

---

## Purpose

Track backup jobs and their results.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| app_id | CHAR(26) | NO | - | App reference |
| backup_destination_id | CHAR(26) | NO | - | Destination |
| type | ENUM | NO | - | database/files/full |
| status | ENUM | NO | pending | Backup status |
| started_at | TIMESTAMP | YES | NULL | Start time |
| finished_at | TIMESTAMP | YES | NULL | End time |
| size_bytes | BIGINT | YES | NULL | Backup size |
| file_path | VARCHAR(500) | YES | NULL | Path in destination |
| checksum | VARCHAR(64) | YES | NULL | SHA256 checksum |
| error_message | TEXT | YES | NULL | Error if failed |
| expires_at | TIMESTAMP | YES | NULL | Auto-delete date |
| created_at | TIMESTAMP | NO | NOW | Created |

---

## Status Values

| Status | Meaning |
|--------|---------|
| pending | Queued |
| running | In progress |
| success | Completed |
| failed | Failed |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| idx_app_created | app_id, created_at DESC | App backup history |
| idx_status | status | Filter by status |
| idx_expires | expires_at | Cleanup job |

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
        Schema::create('backups', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('app_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('backup_destination_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['database', 'files', 'full']);
            $table->enum('status', ['pending', 'running', 'success', 'failed'])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->string('checksum', 64)->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['app_id', 'created_at']);
            $table->index('status');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backups');
    }
};
```
