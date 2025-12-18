# Migration: 005_create_servers_table

**File:** `database/migrations/YYYY_MM_DD_000005_create_servers_table.php`  
**Status:** Pending

---

## Purpose

Store managed server information including SSH credentials and agent tokens.

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| name | VARCHAR(100) | NO | - | Display name |
| host | VARCHAR(255) | NO | - | IP or hostname |
| port | INT | NO | 22 | SSH port |
| username | VARCHAR(50) | NO | 'upanel' | SSH user |
| ssh_private_key | TEXT | NO | - | Encrypted Ed25519 key |
| ssh_public_key | TEXT | NO | - | Public key |
| agent_token | VARCHAR(255) | YES | NULL | Hashed agent token |
| agent_port | INT | NO | 8443 | Agent API port |
| status | ENUM | NO | 'pending' | pending/online/offline/error |
| last_seen_at | TIMESTAMP | YES | NULL | Last agent heartbeat |
| os_version | VARCHAR(50) | YES | NULL | Ubuntu version |
| cpu_cores | INT | YES | NULL | CPU count |
| ram_mb | INT | YES | NULL | Total RAM |
| disk_gb | INT | YES | NULL | Total disk |
| hardened_at | TIMESTAMP | YES | NULL | When hardening ran |
| security_score | INT | YES | NULL | 0-100 audit score |
| created_at | TIMESTAMP | NO | NOW | Record creation |
| updated_at | TIMESTAMP | NO | NOW | Last update |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| PRIMARY | id | Primary key |
| idx_status | status | Filter by status |
| idx_last_seen | last_seen_at | Offline detection |

---

## Model Configuration

```php
<?php

declare(strict_types=1);

namespace App\Models;

use App\Policies\ServerPolicy;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UsePolicy(ServerPolicy::class)]
final class Server extends Model
{
    use HasUlids;

    protected $fillable = [
        'name',
        'host',
        'port',
        'username',
        'ssh_private_key',
        'ssh_public_key',
        'agent_token',
        'agent_port',
        'status',
        'last_seen_at',
        'os_version',
        'cpu_cores',
        'ram_mb',
        'disk_gb',
        'hardened_at',
        'security_score',
    ];

    protected function casts(): array
    {
        return [
            'ssh_private_key' => 'encrypted',
            'port' => 'integer',
            'agent_port' => 'integer',
            'cpu_cores' => 'integer',
            'ram_mb' => 'integer',
            'disk_gb' => 'integer',
            'security_score' => 'integer',
            'last_seen_at' => 'datetime',
            'hardened_at' => 'datetime',
        ];
    }

    public function apps(): HasMany
    {
        return $this->hasMany(App::class);
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(ServerMetric::class);
    }

    public function isOnline(): bool
    {
        return $this->status === 'online';
    }
}
```

---

## Related

- Feature: [/docs/features/server-management/README.md]
- Full schema: [/docs/08-database-schema.md]
