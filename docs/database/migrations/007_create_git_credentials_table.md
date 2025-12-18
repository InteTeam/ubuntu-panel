# Migration: 007_create_git_credentials_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_git_credentials_table.php`  
**Status:** Pending

---

## Purpose

Store encrypted Git credentials for private repository access.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| name | VARCHAR(100) | NO | - | Friendly name |
| type | ENUM | NO | - | ssh_key, token, basic |
| credentials | TEXT | NO | - | Encrypted JSON |
| created_at | TIMESTAMP | NO | NOW | Created |
| updated_at | TIMESTAMP | NO | NOW | Updated |

---

## Credential Types

**SSH Key:**
```json
{
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----...",
  "passphrase": null
}
```

**Personal Access Token:**
```json
{
  "token": "ghp_xxxxxxxxxxxx"
}
```

**Basic Auth:**
```json
{
  "username": "deploy",
  "password": "secret"
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
        Schema::create('git_credentials', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name', 100);
            $table->enum('type', ['ssh_key', 'token', 'basic']);
            $table->text('credentials'); // Encrypted
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('git_credentials');
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
    ];
}
```
