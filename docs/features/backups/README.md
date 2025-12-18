# Backups Feature

**Status:** Planning  
**Priority:** High  
**Phase:** 4

---

## Overview

Automated and manual backups to Google Drive, Backblaze B2, SFTP, or local storage with retention policies.

---

## User Stories

- As an admin, I want to configure backup destinations (Google Drive, B2, SFTP)
- As an admin, I want to create manual backups of database or files
- As an admin, I want to schedule automatic backups with cron
- As an admin, I want retention policies to auto-delete old backups
- As an admin, I want to restore from a backup
- As an admin, I want notifications when backups fail

---

## Acceptance Criteria

- [ ] Configure backup destinations with encrypted credentials
- [ ] Test destination connectivity before saving
- [ ] Manual backup creates immediate backup job
- [ ] Scheduled backups run via cron expression
- [ ] Database backup: mysqldump/pg_dump compressed
- [ ] Files backup: docker volumes as tar.gz
- [ ] Full backup: both database and files
- [ ] Backups uploaded to configured destination
- [ ] Checksum verification after upload
- [ ] Retention policy deletes old backups
- [ ] Failed backups send email notification
- [ ] Restore downloads and applies backup

---

## Guideline Compliance

See [FEATURE_DESIGN_CHECKLIST.md](/docs/FEATURE_DESIGN_CHECKLIST.md)

**Status:** 0/47 (0%) - Not started

---

## Technical Design

### Database Tables
- `backup_destinations` - [/docs/database/migrations/011_create_backup_destinations_table.md]
- `backups` - [/docs/database/migrations/012_create_backups_table.md]
- `backup_schedules` - [/docs/database/migrations/013_create_backup_schedules_table.md]

### Models
- `App\Models\BackupDestination`
- `App\Models\Backup`
- `App\Models\BackupSchedule`

### Services
- `App\Services\BackupService` - Orchestration
- `App\Services\BackupDestinations\GoogleDriveService`
- `App\Services\BackupDestinations\BackblazeB2Service`
- `App\Services\BackupDestinations\SftpService`
- `App\Services\BackupDestinations\LocalService`

### Controllers
- `App\Http\Controllers\BackupController`
- `App\Http\Controllers\BackupDestinationController`
- `App\Http\Controllers\BackupScheduleController`

### Jobs
- `App\Jobs\CreateBackupJob` - Execute backup
- `App\Jobs\RunScheduledBackupsJob` - Check schedules
- `App\Jobs\CleanupExpiredBackupsJob` - Retention

---

## Frontend Components

### Pages
- `Pages/Backups/Index.tsx` - Backup list
- `Pages/BackupDestinations/Index.tsx` - Destinations

### Components (Reuse)
- `ui/button`, `ui/input`, `ui/card`, `ui/table`, `ui/dialog`, `ui/select`
- `Atoms/LoadingSpinner`, `Atoms/EmptyState`
- `Molecules/FormField`, `Molecules/ConfirmationDialog`

### Components (Create)
- `atoms/BackupStatusBadge` - pending/running/success/failed
- `atoms/BackupTypeIcon` - database/files/full
- `molecules/BackupDestinationCard` - Destination config
- `molecules/BackupRow` - Backup history item
- `molecules/BackupScheduleRow` - Schedule item
- `organisms/BackupDestinationForm` - Add/edit destination
- `organisms/BackupScheduleForm` - Add/edit schedule
- `organisms/CreateBackupModal` - Manual backup

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/backups | List all backups |
| GET | /api/apps/{id}/backups | App backups |
| POST | /api/apps/{id}/backups | Create manual backup |
| DELETE | /api/backups/{id} | Delete backup |
| POST | /api/backups/{id}/restore | Restore backup |
| GET | /api/backup-destinations | List destinations |
| POST | /api/backup-destinations | Add destination |
| PUT | /api/backup-destinations/{id} | Update destination |
| DELETE | /api/backup-destinations/{id} | Delete destination |
| POST | /api/backup-destinations/{id}/test | Test connection |
| GET | /api/apps/{id}/backup-schedules | List schedules |
| POST | /api/apps/{id}/backup-schedules | Create schedule |
| PUT | /api/backup-schedules/{id} | Update schedule |
| DELETE | /api/backup-schedules/{id} | Delete schedule |

---

## Backup Flow

```
1. Job triggered (manual or scheduled)
2. SSH to server
3. Run dump command:
   - MySQL: mysqldump | gzip
   - PostgreSQL: pg_dump | gzip
   - Files: tar -czf volumes
4. Generate checksum (SHA256)
5. Upload to destination
6. Verify upload (checksum match)
7. Clean temp files
8. Update backup record
9. Apply retention (delete old)
10. Send notification if failed
```

---

## Destination Implementations

### Google Drive

```php
// Using Google API client
$client = new Google_Client();
$client->setAuthConfig($credentials['service_account_json']);
$client->addScope(Google_Service_Drive::DRIVE_FILE);

$service = new Google_Service_Drive($client);
$fileMetadata = new Google_Service_Drive_DriveFile([
    'name' => $filename,
    'parents' => [$credentials['folder_id']],
]);
$service->files->create($fileMetadata, [
    'data' => $content,
    'uploadType' => 'multipart',
]);
```

### Backblaze B2

```php
// Using AWS SDK (S3-compatible)
$s3 = new Aws\S3\S3Client([
    'endpoint' => 'https://s3.us-west-000.backblazeb2.com',
    'region' => 'us-west-000',
    'credentials' => [
        'key' => $credentials['key_id'],
        'secret' => $credentials['app_key'],
    ],
]);
$s3->putObject([
    'Bucket' => $credentials['bucket'],
    'Key' => $filename,
    'Body' => $content,
]);
```

### SFTP

```php
// Using phpseclib
$sftp = new SFTP($credentials['host'], $credentials['port']);
$key = PublicKeyLoader::load($credentials['private_key']);
$sftp->login($credentials['username'], $key);
$sftp->put($remotePath, $content);
```

---

## Retention Policy

```php
// After successful backup, apply retention
$schedule = $backup->schedule;
if ($schedule) {
    $keepCount = $schedule->retention_count;
    
    Backup::where('app_id', $backup->app_id)
        ->where('backup_destination_id', $backup->backup_destination_id)
        ->where('type', $backup->type)
        ->where('status', 'success')
        ->orderBy('created_at', 'desc')
        ->skip($keepCount)
        ->take(PHP_INT_MAX)
        ->each(function ($old) {
            // Delete from destination
            $this->deleteFromDestination($old);
            $old->delete();
        });
}
```

---

## Testing

- [ ] Destination credentials encrypted
- [ ] Test connection validates credentials
- [ ] Manual backup creates job
- [ ] Schedule calculates next_run_at
- [ ] Backup job runs mysqldump (mocked)
- [ ] Upload to destination (mocked)
- [ ] Checksum verified after upload
- [ ] Retention deletes old backups
- [ ] Failed backup sends notification
- [ ] Restore downloads and applies

---

## Tasks

See [IMPLEMENTATION_TASKS.md](/docs/IMPLEMENTATION_TASKS.md) - Phase 4
