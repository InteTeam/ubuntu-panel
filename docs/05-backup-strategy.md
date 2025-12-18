# Backup Strategy

## Philosophy

Client data on client storage where possible. Reduces liability and cost.

## Supported Destinations

### Google Drive (Primary)
**Why**: Clients already have it, they pay for storage, they can access backups directly.

**Implementation**: Service account per client
1. Create service account in Google Cloud Console
2. Share target folder with service account email
3. Store credentials JSON in panel (encrypted)
4. Use Google Drive API for uploads

**Pros**: Client owns data, no storage costs for us, familiar to clients
**Cons**: API rate limits, requires Google Cloud setup per client

### Backblaze B2 (For own infrastructure)
**Why**: S3-compatible, 1/4 price of AWS, good for panel's own backups.

**Implementation**: Single B2 account, bucket per server or client
- ~$0.005/GB storage
- ~$0.01/GB download

### SFTP (Universal fallback)
**Why**: Works anywhere, client can provide their own server.

**Implementation**: Store host, port, user, SSH key per destination.

### Local (Emergency/temporary)
**Why**: Quick testing, clients with on-prem requirements.

**Implementation**: Path on managed server, optional USB mount.

---

## What Gets Backed Up

### Databases
- MySQL: `mysqldump --single-transaction`
- PostgreSQL: `pg_dump -Fc` (custom format, compressed)
- Filename: `{app}_{db}_{timestamp}.sql.gz`

### Docker Volumes
- Stop container briefly or use --volumes-from with temp container
- Tar + gzip the volume
- Filename: `{app}_{volume}_{timestamp}.tar.gz`

### Retention Policy (configurable per app)
- Daily: keep 7
- Weekly: keep 4  
- Monthly: keep 3

---

## Backup Job Flow

```
Panel (Horizon job)
    │
    ├── SSH to managed server
    │
    ├── Run dump command (mysqldump/pg_dump)
    │
    ├── Compress output
    │
    ├── Upload to destination (gdrive/b2/sftp)
    │
    ├── Verify upload (checksum)
    │
    ├── Clean up local temp file
    │
    └── Log result to panel DB
```

## Restore Flow

1. User selects backup from history
2. Panel downloads to managed server
3. User confirms (destructive action)
4. Panel runs restore command
5. Optional: restart containers
