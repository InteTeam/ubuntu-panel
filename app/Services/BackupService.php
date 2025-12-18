<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\CreateBackupJob;
use App\Models\App;
use App\Models\Backup;
use App\Models\BackupDestination;
use App\Models\BackupSchedule;
use Cron\CronExpression;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class BackupService
{
    public function getAllBackups(): Collection
    {
        return Backup::query()
            ->with(['app', 'destination'])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();
    }

    public function getBackupsForApp(App $app): Collection
    {
        return Backup::query()
            ->where('app_id', $app->id)
            ->with('destination')
            ->orderByDesc('created_at')
            ->get();
    }

    public function getAllDestinations(): Collection
    {
        return BackupDestination::query()
            ->withCount('backups')
            ->orderBy('name')
            ->get();
    }

    public function getAllSchedules(): Collection
    {
        return BackupSchedule::query()
            ->with(['app', 'destination'])
            ->orderBy('name')
            ->get();
    }

    public function createDestination(array $data): BackupDestination
    {
        return DB::transaction(function () use ($data) {
            if ($data['is_default'] ?? false) {
                BackupDestination::where('is_default', true)->update(['is_default' => false]);
            }

            $destination = BackupDestination::create([
                'name' => $data['name'],
                'type' => $data['type'],
                'credentials' => $data['credentials'],
                'is_default' => $data['is_default'] ?? false,
            ]);

            Log::info('Backup destination created', ['destination_id' => $destination->id]);

            return $destination;
        });
    }

    public function updateDestination(BackupDestination $destination, array $data): BackupDestination
    {
        return DB::transaction(function () use ($destination, $data) {
            if (($data['is_default'] ?? false) && !$destination->is_default) {
                BackupDestination::where('is_default', true)->update(['is_default' => false]);
            }

            $destination->update(array_filter([
                'name' => $data['name'] ?? null,
                'type' => $data['type'] ?? null,
                'credentials' => $data['credentials'] ?? null,
                'is_default' => $data['is_default'] ?? null,
            ], fn ($v) => $v !== null));

            return $destination->fresh();
        });
    }

    public function deleteDestination(BackupDestination $destination): void
    {
        $destination->delete();
        Log::info('Backup destination deleted', ['destination_id' => $destination->id]);
    }

    public function createSchedule(array $data): BackupSchedule
    {
        $schedule = BackupSchedule::create([
            'app_id' => $data['app_id'],
            'destination_id' => $data['destination_id'],
            'name' => $data['name'],
            'type' => $data['type'],
            'cron_expression' => $data['cron_expression'],
            'retention_count' => $data['retention_count'] ?? 7,
            'is_active' => $data['is_active'] ?? true,
            'next_run_at' => $this->calculateNextRun($data['cron_expression']),
        ]);

        Log::info('Backup schedule created', ['schedule_id' => $schedule->id]);

        return $schedule;
    }

    public function updateSchedule(BackupSchedule $schedule, array $data): BackupSchedule
    {
        $schedule->update(array_filter([
            'name' => $data['name'] ?? null,
            'destination_id' => $data['destination_id'] ?? null,
            'type' => $data['type'] ?? null,
            'cron_expression' => $data['cron_expression'] ?? null,
            'retention_count' => $data['retention_count'] ?? null,
            'is_active' => $data['is_active'] ?? null,
        ], fn ($v) => $v !== null));

        if (isset($data['cron_expression'])) {
            $schedule->update(['next_run_at' => $this->calculateNextRun($data['cron_expression'])]);
        }

        return $schedule->fresh();
    }

    public function deleteSchedule(BackupSchedule $schedule): void
    {
        $schedule->delete();
        Log::info('Backup schedule deleted', ['schedule_id' => $schedule->id]);
    }

    public function createBackup(App $app, BackupDestination $destination, string $type = 'full', ?BackupSchedule $schedule = null): Backup
    {
        $backup = Backup::create([
            'app_id' => $app->id,
            'destination_id' => $destination->id,
            'schedule_id' => $schedule?->id,
            'type' => $type,
            'status' => 'queued',
        ]);

        Log::info('Backup queued', ['backup_id' => $backup->id, 'app_id' => $app->id]);

        CreateBackupJob::dispatch($backup);

        return $backup;
    }

    public function startBackup(Backup $backup): void
    {
        $backup->update([
            'status' => 'running',
            'started_at' => now(),
        ]);
    }

    public function completeBackup(Backup $backup, string $filePath, int $fileSize, string $checksum): void
    {
        $backup->update([
            'status' => 'success',
            'file_path' => $filePath,
            'file_size_bytes' => $fileSize,
            'checksum' => $checksum,
            'finished_at' => now(),
        ]);

        Log::info('Backup completed', ['backup_id' => $backup->id]);
    }

    public function failBackup(Backup $backup, string $errorMessage): void
    {
        $backup->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'finished_at' => now(),
        ]);

        Log::error('Backup failed', ['backup_id' => $backup->id, 'error' => $errorMessage]);
    }

    public function enforceRetention(BackupSchedule $schedule): int
    {
        $backupsToDelete = $schedule->backups()
            ->where('status', 'success')
            ->orderByDesc('created_at')
            ->skip($schedule->retention_count)
            ->take(100)
            ->get();

        foreach ($backupsToDelete as $backup) {
            $backup->delete();
        }

        return $backupsToDelete->count();
    }

    private function calculateNextRun(string $cronExpression): \DateTime
    {
        $cron = new CronExpression($cronExpression);

        return $cron->getNextRunDate();
    }
}
