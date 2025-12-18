# Migration: 011_create_backup_destinations_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_backup_destinations_table.php`  
**Status:** Pending

---

## Purpose

Store backup destination configurations (Google Drive, B2, SFTP, local).

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| name | VARCHAR(100) | NO | - | Friendly name |
| type | ENUM | NO | - | Destination type |
| credentials | TEXT | NO | - | Encrypted JSON |
| is_default | BOOLEAN | NO | FALSE | Default destination |
| created_at | TIMESTAMP | NO | NOW | Created |
| updated_at | TIMESTAMP | NO | NOW | Updated |

---

## Destination Types & Credentials

**Google Drive:**
```json
{
  "service_account_json": "{...}",
  "folder_id": "1ABC..."
}
```

**Backblaze B2:**
```json
{
  "key_id": "000...",
  "app_key": "K000...",
  "bucket": "my-bucket"
}
```

**SFTP:**
```json
{
  "host": "backup.example.com",
  "port": 22,
  "username": "backup",
  "private_key": "-----BEGIN..."
}
```

**Local:**
```json
{
  "path": "/backups"
}
```

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
        Schema::create('backup_destinations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name', 100);
            $table->enum('type', ['google_drive', 'backblaze_b2', 'sftp', 'local']);
            $table->text('credentials'); // Encrypted
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backup_destinations');
    }
};
```

---

## Model Cast

```php
protected function casts(): array
{
    return [
        'credentials' => 'encrypted:json',
        'is_default' => 'boolean',
    ];
}
```
