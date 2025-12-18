# Migration: 008_create_apps_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_apps_table.php`  
**Status:** Pending

---

## Purpose

Store application configurations for deployment management.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| server_id | CHAR(26) | NO | - | Server reference |
| name | VARCHAR(100) | NO | - | App name |
| git_repository | VARCHAR(500) | NO | - | Git URL |
| git_branch | VARCHAR(100) | NO | main | Default branch |
| git_credentials_id | CHAR(26) | YES | NULL | For private repos |
| deploy_path | VARCHAR(255) | NO | - | Server path |
| docker_compose_file | VARCHAR(100) | NO | docker-compose.yml | Compose file |
| env_vars | TEXT | YES | NULL | Encrypted JSON |
| env_production | TEXT | YES | NULL | Production overrides |
| env_staging | TEXT | YES | NULL | Staging overrides |
| primary_domain | VARCHAR(255) | YES | NULL | Production domain |
| staging_domain | VARCHAR(255) | YES | NULL | Staging domain |
| status | ENUM | NO | pending | App status |
| current_commit | VARCHAR(40) | YES | NULL | Deployed commit |
| created_at | TIMESTAMP | NO | NOW | Created |
| updated_at | TIMESTAMP | NO | NOW | Updated |

---

## Status Values

| Status | Meaning |
|--------|---------|
| pending | Created, not deployed |
| deploying | Deployment in progress |
| running | Containers running |
| stopped | Containers stopped |
| failed | Last deployment failed |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| idx_server | server_id | Apps per server |
| idx_status | status | Filter by status |

---

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| server_id | servers(id) | CASCADE |
| git_credentials_id | git_credentials(id) | SET NULL |

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
        Schema::create('apps', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('server_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('git_repository', 500);
            $table->string('git_branch', 100)->default('main');
            $table->foreignUlid('git_credentials_id')->nullable()->constrained()->nullOnDelete();
            $table->string('deploy_path', 255);
            $table->string('docker_compose_file', 100)->default('docker-compose.yml');
            $table->text('env_vars')->nullable();
            $table->text('env_production')->nullable();
            $table->text('env_staging')->nullable();
            $table->string('primary_domain', 255)->nullable();
            $table->string('staging_domain', 255)->nullable();
            $table->enum('status', ['pending', 'deploying', 'running', 'stopped', 'failed'])->default('pending');
            $table->string('current_commit', 40)->nullable();
            $table->timestamps();

            $table->index('server_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apps');
    }
};
```

---

## Model Casts

```php
protected function casts(): array
{
    return [
        'env_vars' => 'encrypted:json',
        'env_production' => 'encrypted:json',
        'env_staging' => 'encrypted:json',
    ];
}
```
