# Migration: 003_create_password_reset_tokens_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_password_reset_tokens_table.php`  
**Status:** Pending

---

## Purpose

Store password reset tokens with expiration for secure password recovery.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| email | VARCHAR(255) | NO | - | User email (primary key) |
| token | VARCHAR(255) | NO | - | Hashed reset token |
| created_at | TIMESTAMP | YES | NULL | Token creation time |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| PRIMARY | email | One token per email |

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
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }
};
```

---

## Token Lifecycle

1. User requests reset → token generated, hashed, stored
2. Email sent with unhashed token in URL
3. User clicks link → token validated against hash
4. Password updated → token deleted
5. Tokens expire after 1 hour (config/auth.php)

---

## Security Notes

- Token is hashed before storage (like passwords)
- One token per email (new request replaces old)
- Expiration enforced in application code
- Rate limited: 3 requests/hour/email
