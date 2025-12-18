# Migration: 006_create_server_metrics_table

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_create_server_metrics_table.php`  
**Status:** Pending

---

## Purpose

Store server resource metrics from agent heartbeats for historical charts.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| server_id | CHAR(26) | NO | - | Server reference |
| cpu_percent | DECIMAL(5,2) | NO | - | CPU usage 0-100 |
| ram_used_mb | INT | NO | - | RAM used in MB |
| ram_total_mb | INT | NO | - | Total RAM in MB |
| disk_used_gb | INT | NO | - | Disk used in GB |
| disk_total_gb | INT | NO | - | Total disk in GB |
| network_in_bytes | BIGINT | YES | NULL | Network received |
| network_out_bytes | BIGINT | YES | NULL | Network sent |
| recorded_at | TIMESTAMP | NO | NOW | Metric timestamp |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| PRIMARY | id | Primary key |
| idx_server_recorded | server_id, recorded_at DESC | Server metrics history |

---

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| server_id | servers(id) | CASCADE |

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
        Schema::create('server_metrics', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('server_id')->constrained()->cascadeOnDelete();
            $table->decimal('cpu_percent', 5, 2);
            $table->unsignedInteger('ram_used_mb');
            $table->unsignedInteger('ram_total_mb');
            $table->unsignedInteger('disk_used_gb');
            $table->unsignedInteger('disk_total_gb');
            $table->unsignedBigInteger('network_in_bytes')->nullable();
            $table->unsignedBigInteger('network_out_bytes')->nullable();
            $table->timestamp('recorded_at')->useCurrent();

            $table->index(['server_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('server_metrics');
    }
};
```

---

## Retention

Keep 7 days of metrics. Cleanup job:

```php
ServerMetric::where('recorded_at', '<', now()->subDays(7))->delete();
```
