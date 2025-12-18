# Database Schema

Complete database design for UPanel MVP.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| IDs | ULIDs | Sortable, no auto-increment leaks |
| SSH keys | Encrypted in DB | Simpler than Vault for MVP, portable |
| Env vars | Encrypted JSON in DB | Per-app secrets, encrypted at rest |
| Timestamps | UTC always | Convert to user TZ in frontend |

---

## Schema

### users

```sql
CREATE TABLE users (
    id CHAR(26) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    two_factor_secret TEXT NULL,
    two_factor_confirmed_at TIMESTAMP NULL,
    recovery_codes TEXT NULL,
    role ENUM('admin', 'operator', 'viewer') DEFAULT 'admin',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### servers

```sql
CREATE TABLE servers (
    id CHAR(26) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    host VARCHAR(255) NOT NULL,              -- IP or hostname
    port INT DEFAULT 22,
    username VARCHAR(50) DEFAULT 'upanel',
    ssh_private_key TEXT NOT NULL,           -- Encrypted
    ssh_public_key TEXT NOT NULL,
    agent_token VARCHAR(255) NULL,           -- Hashed, for agent auth
    agent_port INT DEFAULT 8443,
    
    -- Status
    status ENUM('pending', 'online', 'offline', 'error') DEFAULT 'pending',
    last_seen_at TIMESTAMP NULL,
    
    -- Metadata (populated by agent)
    os_version VARCHAR(50) NULL,
    cpu_cores INT NULL,
    ram_mb INT NULL,
    disk_gb INT NULL,
    
    -- Security
    hardened_at TIMESTAMP NULL,              -- When hardening script ran
    security_score INT NULL,                 -- 0-100, from security audit
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_last_seen (last_seen_at)
);
```

### apps

```sql
CREATE TABLE apps (
    id CHAR(26) PRIMARY KEY,
    server_id CHAR(26) NOT NULL,
    name VARCHAR(100) NOT NULL,
    
    -- Git
    git_repository VARCHAR(500) NOT NULL,    -- https://github.com/user/repo.git
    git_branch VARCHAR(100) DEFAULT 'main',
    git_credentials_id CHAR(26) NULL,        -- Optional, for private repos
    
    -- Deployment
    deploy_path VARCHAR(255) NOT NULL,       -- /var/www/myapp
    docker_compose_file VARCHAR(100) DEFAULT 'docker-compose.yml',
    
    -- Environment
    env_vars TEXT NULL,                      -- Encrypted JSON
    env_production TEXT NULL,                -- Encrypted, production overrides
    env_staging TEXT NULL,                   -- Encrypted, staging overrides
    
    -- Domains
    primary_domain VARCHAR(255) NULL,
    staging_domain VARCHAR(255) NULL,
    
    -- Status
    status ENUM('pending', 'deploying', 'running', 'stopped', 'failed') DEFAULT 'pending',
    current_commit VARCHAR(40) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    FOREIGN KEY (git_credentials_id) REFERENCES git_credentials(id) ON DELETE SET NULL,
    INDEX idx_server (server_id),
    INDEX idx_status (status)
);
```

### git_credentials

```sql
CREATE TABLE git_credentials (
    id CHAR(26) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('ssh_key', 'token', 'basic') NOT NULL,
    credentials TEXT NOT NULL,               -- Encrypted JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### deployments

```sql
CREATE TABLE deployments (
    id CHAR(26) PRIMARY KEY,
    app_id CHAR(26) NOT NULL,
    user_id CHAR(26) NULL,                   -- Who triggered it
    
    -- Git info
    commit_hash VARCHAR(40) NOT NULL,
    commit_message TEXT NULL,
    branch VARCHAR(100) NOT NULL,
    
    -- Environment
    environment ENUM('production', 'staging') NOT NULL,
    
    -- Status
    status ENUM('queued', 'running', 'success', 'failed', 'cancelled') DEFAULT 'queued',
    started_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    duration_seconds INT NULL,
    
    -- Output
    log TEXT NULL,                           -- Deployment log
    error_message TEXT NULL,
    
    -- Rollback
    is_rollback BOOLEAN DEFAULT FALSE,
    rollback_from_id CHAR(26) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (rollback_from_id) REFERENCES deployments(id) ON DELETE SET NULL,
    INDEX idx_app_created (app_id, created_at DESC),
    INDEX idx_status (status)
);
```

### domains

```sql
CREATE TABLE domains (
    id CHAR(26) PRIMARY KEY,
    app_id CHAR(26) NOT NULL,
    server_id CHAR(26) NOT NULL,
    
    domain VARCHAR(255) NOT NULL,
    environment ENUM('production', 'staging') DEFAULT 'production',
    
    -- SSL
    ssl_enabled BOOLEAN DEFAULT TRUE,
    ssl_auto_renew BOOLEAN DEFAULT TRUE,
    ssl_expires_at TIMESTAMP NULL,
    
    -- Proxy
    upstream_port INT NOT NULL,              -- Container port
    
    -- Status
    status ENUM('pending', 'active', 'error') DEFAULT 'pending',
    caddy_configured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_domain (domain),
    INDEX idx_app (app_id)
);
```

### backups

```sql
CREATE TABLE backups (
    id CHAR(26) PRIMARY KEY,
    app_id CHAR(26) NOT NULL,
    backup_destination_id CHAR(26) NOT NULL,
    
    -- Type
    type ENUM('database', 'files', 'full') NOT NULL,
    
    -- Status
    status ENUM('pending', 'running', 'success', 'failed') DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    
    -- Details
    size_bytes BIGINT NULL,
    file_path VARCHAR(500) NULL,             -- Path in destination
    checksum VARCHAR(64) NULL,               -- SHA256
    
    -- Error
    error_message TEXT NULL,
    
    -- Retention
    expires_at TIMESTAMP NULL,               -- Auto-delete after this
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY (backup_destination_id) REFERENCES backup_destinations(id) ON DELETE CASCADE,
    INDEX idx_app_created (app_id, created_at DESC),
    INDEX idx_status (status),
    INDEX idx_expires (expires_at)
);
```

### backup_destinations

```sql
CREATE TABLE backup_destinations (
    id CHAR(26) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('google_drive', 'backblaze_b2', 'sftp', 'local') NOT NULL,
    
    -- Credentials (encrypted JSON, structure depends on type)
    credentials TEXT NOT NULL,
    
    -- Google Drive: { "service_account_json": "...", "folder_id": "..." }
    -- Backblaze B2: { "key_id": "...", "app_key": "...", "bucket": "..." }
    -- SFTP: { "host": "...", "port": 22, "username": "...", "private_key": "..." }
    -- Local: { "path": "/backups" }
    
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### backup_schedules

```sql
CREATE TABLE backup_schedules (
    id CHAR(26) PRIMARY KEY,
    app_id CHAR(26) NOT NULL,
    backup_destination_id CHAR(26) NOT NULL,
    
    type ENUM('database', 'files', 'full') NOT NULL,
    
    -- Schedule (cron format)
    cron_expression VARCHAR(100) NOT NULL,   -- "0 2 * * *" = daily 2am
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Retention
    retention_count INT DEFAULT 7,           -- Keep last N backups
    
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP NULL,
    next_run_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY (backup_destination_id) REFERENCES backup_destinations(id) ON DELETE CASCADE,
    INDEX idx_next_run (next_run_at),
    INDEX idx_active (is_active)
);
```

### server_metrics

```sql
CREATE TABLE server_metrics (
    id CHAR(26) PRIMARY KEY,
    server_id CHAR(26) NOT NULL,
    
    cpu_percent DECIMAL(5,2) NOT NULL,
    ram_used_mb INT NOT NULL,
    ram_total_mb INT NOT NULL,
    disk_used_gb INT NOT NULL,
    disk_total_gb INT NOT NULL,
    
    -- Network (optional)
    network_in_bytes BIGINT NULL,
    network_out_bytes BIGINT NULL,
    
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    INDEX idx_server_recorded (server_id, recorded_at DESC)
);

-- Cleanup: keep 7 days of metrics
-- Cron job: DELETE FROM server_metrics WHERE recorded_at < NOW() - INTERVAL 7 DAY
```

### security_events

```sql
CREATE TABLE security_events (
    id CHAR(26) PRIMARY KEY,
    user_id CHAR(26) NULL,
    server_id CHAR(26) NULL,
    
    event_type VARCHAR(50) NOT NULL,         -- login_success, login_failed, etc.
    severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
    
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    details JSON NULL,                       -- Event-specific data
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE SET NULL,
    INDEX idx_type_created (event_type, created_at DESC),
    INDEX idx_severity (severity),
    INDEX idx_user (user_id)
);
```

### notifications

```sql
CREATE TABLE notifications (
    id CHAR(26) PRIMARY KEY,
    user_id CHAR(26) NOT NULL,
    
    type VARCHAR(50) NOT NULL,               -- deployment_failed, backup_failed, server_offline
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Reference
    notifiable_type VARCHAR(50) NULL,        -- App, Server, Backup
    notifiable_id CHAR(26) NULL,
    
    -- Status
    read_at TIMESTAMP NULL,
    email_sent_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, read_at),
    INDEX idx_created (created_at DESC)
);
```

### activity_log

```sql
CREATE TABLE activity_log (
    id CHAR(26) PRIMARY KEY,
    user_id CHAR(26) NULL,
    
    action VARCHAR(50) NOT NULL,             -- created, updated, deleted, deployed
    subject_type VARCHAR(50) NOT NULL,       -- Server, App, Backup
    subject_id CHAR(26) NOT NULL,
    
    description TEXT NULL,
    changes JSON NULL,                       -- { "field": { "old": x, "new": y } }
    
    ip_address VARCHAR(45) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_subject (subject_type, subject_id),
    INDEX idx_created (created_at DESC)
);
```

---

## Encryption

All sensitive fields use Laravel's `encrypt()` / `decrypt()`:

- `servers.ssh_private_key`
- `apps.env_vars`, `apps.env_production`, `apps.env_staging`
- `git_credentials.credentials`
- `backup_destinations.credentials`
- `users.two_factor_secret`, `users.recovery_codes`

Encryption key in `.env`:
```
APP_KEY=base64:...
```

For production, consider rotating keys with envelope encryption.

---

## Indexes Summary

Performance-critical queries:

| Query | Index |
|-------|-------|
| List servers by status | `idx_status` on servers |
| List apps for server | `idx_server` on apps |
| Recent deployments for app | `idx_app_created` on deployments |
| Pending backups | `idx_status` on backups |
| Next backup to run | `idx_next_run` on backup_schedules |
| Server metrics history | `idx_server_recorded` on server_metrics |
| Unread notifications | `idx_user_unread` on notifications |

---

## Migrations Order

```
001_create_users_table
002_create_sessions_table
003_create_password_reset_tokens_table
004_create_servers_table
005_create_git_credentials_table
006_create_apps_table
007_create_deployments_table
008_create_domains_table
009_create_backup_destinations_table
010_create_backups_table
011_create_backup_schedules_table
012_create_server_metrics_table
013_create_security_events_table
014_create_notifications_table
015_create_activity_log_table
016_create_login_attempts_table
017_create_user_invites_table
```
