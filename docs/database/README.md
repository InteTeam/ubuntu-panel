# Database Architecture

**Database:** PostgreSQL 16  
**IDs:** ULIDs (sortable, no auto-increment leaks)  
**Encryption:** Laravel `encrypt()` for sensitive fields

---

## Tables Overview (16 Tables)

| # | Table | Purpose | Phase |
|---|-------|---------|-------|
| 001 | [users](migrations/001_create_users_table.md) | Admin accounts + 2FA | 1 |
| 002 | [sessions](migrations/002_create_sessions_table.md) | Login sessions | 1 |
| 003 | [password_reset_tokens](migrations/003_create_password_reset_tokens_table.md) | Password resets | 1 |
| 004 | [login_attempts](migrations/004_create_login_attempts_table.md) | Login audit trail | 1 |
| 005 | [servers](migrations/005_create_servers_table.md) | Managed servers | 2 |
| 006 | [server_metrics](migrations/006_create_server_metrics_table.md) | CPU/RAM/Disk history | 2 |
| 007 | [git_credentials](migrations/007_create_git_credentials_table.md) | Private repo access | 3 |
| 008 | [apps](migrations/008_create_apps_table.md) | Deployed applications | 3 |
| 009 | [deployments](migrations/009_create_deployments_table.md) | Deployment history | 3 |
| 010 | [domains](migrations/010_create_domains_table.md) | App domains + SSL | 3 |
| 011 | [backup_destinations](migrations/011_create_backup_destinations_table.md) | Backup targets | 4 |
| 012 | [backups](migrations/012_create_backups_table.md) | Backup records | 4 |
| 013 | [backup_schedules](migrations/013_create_backup_schedules_table.md) | Scheduled backups | 4 |
| 014 | [security_events](migrations/014_create_security_events_table.md) | Security audit log | 1 |
| 015 | [notifications](migrations/015_create_notifications_table.md) | In-app notifications | 4 |
| 016 | [activity_log](migrations/016_create_activity_log_table.md) | User activity | 4 |

---

## Encryption Strategy

All sensitive fields use Laravel's `encrypt()` with `APP_KEY`:

| Table | Encrypted Fields |
|-------|------------------|
| users | two_factor_secret, recovery_codes |
| servers | ssh_private_key |
| apps | env_vars, env_production, env_staging |
| git_credentials | credentials |
| backup_destinations | credentials |

**Model cast:**
```php
protected function casts(): array
{
    return [
        'ssh_private_key' => 'encrypted',
        'credentials' => 'encrypted:json',
    ];
}
```

---

## Index Strategy

**Mandatory indexes:**
- Primary key on `id` (ULID)
- Foreign keys auto-indexed
- Status columns for filtering
- Timestamp columns for ordering

**Pattern examples:**
```sql
-- Status filtering
CREATE INDEX idx_status ON servers(status);

-- Time-based queries
CREATE INDEX idx_created ON deployments(created_at DESC);

-- Composite for common queries
CREATE INDEX idx_server_recorded ON server_metrics(server_id, recorded_at DESC);
```

---

## Relationships

```
users
  └── has many: sessions, login_attempts, security_events, notifications, activity_log

servers
  ├── has many: apps, server_metrics, security_events
  └── has many: domains (through apps)

apps
  ├── belongs to: server, git_credentials (optional)
  ├── has many: deployments, domains, backups, backup_schedules
  └── encrypted: env_vars, env_production, env_staging

deployments
  ├── belongs to: app, user
  └── self-referential: rollback_from_id

backup_destinations
  └── has many: backups, backup_schedules
```

---

## Migration Order

Migrations must run in order due to foreign key dependencies:

```
001 users           (no dependencies)
002 sessions        (depends on: users)
003 password_reset  (no dependencies)
004 login_attempts  (no dependencies)
005 servers         (no dependencies)
006 server_metrics  (depends on: servers)
007 git_credentials (no dependencies)
008 apps            (depends on: servers, git_credentials)
009 deployments     (depends on: apps, users)
010 domains         (depends on: apps, servers)
011 backup_dest     (no dependencies)
012 backups         (depends on: apps, backup_destinations)
013 backup_sched    (depends on: apps, backup_destinations)
014 security_events (depends on: users, servers)
015 notifications   (depends on: users)
016 activity_log    (depends on: users)
```

---

## Cleanup Jobs

| Table | Retention | Schedule |
|-------|-----------|----------|
| server_metrics | 7 days | Daily |
| login_attempts | 30 days | Weekly |
| security_events | 90 days | Weekly |
| notifications | 30 days | Weekly |
| activity_log | 90 days | Weekly |

---

## Full Schema Reference

See [/docs/08-database-schema.md](/docs/08-database-schema.md) for complete SQL definitions.
