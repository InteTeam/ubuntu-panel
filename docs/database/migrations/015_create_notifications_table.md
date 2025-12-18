# Migration: 015_create_notifications_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_notifications_table.php`  
**Status:** Pending

---

## Purpose

Store in-app notifications with read status.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| user_id | CHAR(26) | NO | - | Recipient |
| type | VARCHAR(50) | NO | - | Notification type |
| title | VARCHAR(255) | NO | - | Short title |
| message | TEXT | NO | - | Full message |
| notifiable_type | VARCHAR(50) | YES | NULL | Related model |
| notifiable_id | CHAR(26) | YES | NULL | Related ID |
| read_at | TIMESTAMP | YES | NULL | When read |
| email_sent_at | TIMESTAMP | YES | NULL | Email sent |
| created_at | TIMESTAMP | NO | NOW | Created |

---

## Notification Types

| Type | Triggers Email | Description |
|------|---------------|-------------|
| deployment_success | No | Deployment completed |
| deployment_failed | Yes | Deployment failed |
| server_offline | Yes | Server not responding |
| server_online | No | Server back online |
| backup_success | No | Backup completed |
| backup_failed | Yes | Backup failed |
| ssl_expiring | Yes | SSL cert expires soon |
| ssl_expired | Yes | SSL cert expired |
| disk_space_low | Yes | Disk usage > 90% |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| idx_user_unread | user_id, read_at | Unread count |
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
        Schema::create('notifications', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('title', 255);
            $table->text('message');
            $table->string('notifiable_type', 50)->nullable();
            $table->ulid('notifiable_id')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('email_sent_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'read_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
```

---

## Cleanup

```php
// Delete notifications older than 30 days
Notification::where('created_at', '<', now()->subDays(30))->delete();
```
