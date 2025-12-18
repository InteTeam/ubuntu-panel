# Migration: 016_create_activity_log_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_activity_log_table.php`  
**Status:** Pending

---

## Purpose

General activity audit trail for all user actions.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| user_id | CHAR(26) | YES | NULL | Who acted |
| action | VARCHAR(50) | NO | - | Action type |
| subject_type | VARCHAR(50) | NO | - | Model class |
| subject_id | CHAR(26) | NO | - | Model ID |
| description | TEXT | YES | NULL | Human description |
| changes | JSON | YES | NULL | Old/new values |
| ip_address | VARCHAR(45) | YES | NULL | Client IP |
| created_at | TIMESTAMP | NO | NOW | When |

---

## Actions

| Action | Description |
|--------|-------------|
| created | Record created |
| updated | Record updated |
| deleted | Record deleted |
| deployed | App deployed |
| rolled_back | Deployment rolled back |
| started | Backup/job started |
| completed | Backup/job completed |
| rebooted | Server rebooted |

---

## Changes Format

```json
{
  "name": {
    "old": "Old Name",
    "new": "New Name"
  },
  "status": {
    "old": "pending",
    "new": "running"
  }
}
```

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| idx_subject | subject_type, subject_id | History per record |
| idx_created | created_at DESC | Recent first |

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
        Schema::create('activity_log', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 50);
            $table->string('subject_type', 50);
            $table->ulid('subject_id');
            $table->text('description')->nullable();
            $table->json('changes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['subject_type', 'subject_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_log');
    }
};
```

---

## Usage

```php
ActivityLog::log('updated', $server, [
    'name' => ['old' => $server->getOriginal('name'), 'new' => $server->name],
]);
```

---

## Retention

Keep 90 days of activity:

```php
ActivityLog::where('created_at', '<', now()->subDays(90))->delete();
```
