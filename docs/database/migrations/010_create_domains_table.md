# Migration: 010_create_domains_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_domains_table.php`  
**Status:** Pending

---

## Purpose

Track domains configured in Caddy with SSL status.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| app_id | CHAR(26) | NO | - | App reference |
| server_id | CHAR(26) | NO | - | Server reference |
| domain | VARCHAR(255) | NO | - | Domain name |
| environment | ENUM | NO | production | production/staging |
| ssl_enabled | BOOLEAN | NO | TRUE | SSL active |
| ssl_auto_renew | BOOLEAN | NO | TRUE | Auto-renew cert |
| ssl_expires_at | TIMESTAMP | YES | NULL | Cert expiry |
| upstream_port | INT | NO | - | Container port |
| status | ENUM | NO | pending | Domain status |
| caddy_configured | BOOLEAN | NO | FALSE | In Caddy config |
| created_at | TIMESTAMP | NO | NOW | Created |
| updated_at | TIMESTAMP | NO | NOW | Updated |

---

## Status Values

| Status | Meaning |
|--------|---------|
| pending | Not configured yet |
| active | Working, SSL valid |
| error | Configuration failed |

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
        Schema::create('domains', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('app_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('server_id')->constrained()->cascadeOnDelete();
            $table->string('domain', 255)->unique();
            $table->enum('environment', ['production', 'staging'])->default('production');
            $table->boolean('ssl_enabled')->default(true);
            $table->boolean('ssl_auto_renew')->default(true);
            $table->timestamp('ssl_expires_at')->nullable();
            $table->unsignedInteger('upstream_port');
            $table->enum('status', ['pending', 'active', 'error'])->default('pending');
            $table->boolean('caddy_configured')->default(false);
            $table->timestamps();

            $table->index('app_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domains');
    }
};
```
