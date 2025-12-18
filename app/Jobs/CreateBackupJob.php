<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Backup;
use App\Services\BackupService;
use App\Services\SshService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Throwable;

final class CreateBackupJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 1;
    public int $timeout = 1800; // 30 minutes

    public function __construct(
        public Backup $backup,
    ) {
        $this->onQueue('backups');
    }

    public function handle(SshService $sshService, BackupService $backupService): void
    {
        $backup = $this->backup;
        $app = $backup->app;
        $server = $app->server;
        $destination = $backup->destination;

        $backupService->startBackup($backup);

        try {
            $ssh = $sshService->connect(
                $server->host,
                $server->port,
                $server->username,
                decrypt($server->ssh_private_key)
            );

            $timestamp = now()->format('Y-m-d_H-i-s');
            $backupName = Str::slug($app->name) . '_' . $timestamp;
            $localBackupPath = "/tmp/{$backupName}.tar.gz";

            if ($backup->type === 'database') {
                $this->createDatabaseBackup($sshService, $ssh, $app, $localBackupPath);
            } else {
                $this->createFullBackup($sshService, $ssh, $app, $localBackupPath);
            }

            $fileSize = (int) trim($sshService->execute($ssh, "stat -c%s {$localBackupPath}"));
            $checksum = trim($sshService->execute($ssh, "sha256sum {$localBackupPath} | cut -d' ' -f1"));

            $remotePath = $this->uploadToDestination($sshService, $ssh, $destination, $localBackupPath, $backupName);

            $sshService->execute($ssh, "rm -f {$localBackupPath}");
            $ssh->disconnect();

            $backupService->completeBackup($backup, $remotePath, $fileSize, $checksum);
        } catch (Throwable $e) {
            $backupService->failBackup($backup, $e->getMessage());
            throw $e;
        }
    }

    private function createFullBackup($sshService, $ssh, $app, string $outputPath): void
    {
        $deployPath = $app->deploy_path;
        $sshService->execute($ssh, "cd {$deployPath} && tar -czf {$outputPath} --exclude='*.log' --exclude='node_modules' .");
    }

    private function createDatabaseBackup($sshService, $ssh, $app, string $outputPath): void
    {
        $deployPath = $app->deploy_path;
        $composeContent = $sshService->execute($ssh, "cat {$deployPath}/{$app->docker_compose_file}");

        if (str_contains($composeContent, 'postgres')) {
            $sshService->execute($ssh, "cd {$deployPath} && docker compose exec -T db pg_dumpall -U postgres | gzip > {$outputPath}");
        } elseif (str_contains($composeContent, 'mysql') || str_contains($composeContent, 'mariadb')) {
            $sshService->execute($ssh, "cd {$deployPath} && docker compose exec -T db mysqldump -u root --all-databases | gzip > {$outputPath}");
        } else {
            throw new \RuntimeException('Could not detect database type for backup');
        }
    }

    private function uploadToDestination($sshService, $ssh, $destination, string $localPath, string $backupName): string
    {
        $credentials = $destination->credentials;

        return match ($destination->type) {
            'local' => $this->uploadLocal($sshService, $ssh, $localPath, $credentials['path'] ?? '/backups', $backupName),
            'sftp' => $this->uploadSftp($sshService, $ssh, $localPath, $credentials, $backupName),
            'b2' => $this->uploadB2($sshService, $ssh, $localPath, $credentials, $backupName),
            'google_drive' => $this->uploadGoogleDrive($sshService, $ssh, $localPath, $credentials, $backupName),
            default => throw new \RuntimeException("Unsupported destination type: {$destination->type}"),
        };
    }

    private function uploadLocal($sshService, $ssh, string $localPath, string $destPath, string $backupName): string
    {
        $remotePath = "{$destPath}/{$backupName}.tar.gz";
        $sshService->execute($ssh, "mkdir -p {$destPath}");
        $sshService->execute($ssh, "cp {$localPath} {$remotePath}");
        return $remotePath;
    }

    private function uploadSftp($sshService, $ssh, string $localPath, array $credentials, string $backupName): string
    {
        $host = $credentials['host'];
        $port = $credentials['port'] ?? 22;
        $user = $credentials['username'];
        $keyPath = '/tmp/sftp_key_' . uniqid();
        $remotePath = ($credentials['path'] ?? '/') . "/{$backupName}.tar.gz";

        $sshService->execute($ssh, "echo '{$credentials['private_key']}' > {$keyPath} && chmod 600 {$keyPath}");
        $sshService->execute($ssh, "scp -i {$keyPath} -P {$port} -o StrictHostKeyChecking=no {$localPath} {$user}@{$host}:{$remotePath}");
        $sshService->execute($ssh, "rm -f {$keyPath}");

        return "sftp://{$host}{$remotePath}";
    }

    private function uploadB2($sshService, $ssh, string $localPath, array $credentials, string $backupName): string
    {
        $bucket = $credentials['bucket'];
        $keyId = $credentials['key_id'];
        $appKey = $credentials['app_key'];
        $remotePath = ($credentials['path'] ?? '') . "/{$backupName}.tar.gz";

        $sshService->execute($ssh, "B2_APPLICATION_KEY_ID='{$keyId}' B2_APPLICATION_KEY='{$appKey}' b2 upload-file {$bucket} {$localPath} {$remotePath}");

        return "b2://{$bucket}{$remotePath}";
    }

    private function uploadGoogleDrive($sshService, $ssh, string $localPath, array $credentials, string $backupName): string
    {
        $folderId = $credentials['folder_id'];
        $sshService->execute($ssh, "rclone copy {$localPath} gdrive:{$folderId}/ --drive-service-account-file=/etc/upanel/gdrive-sa.json");
        return "gdrive://{$folderId}/{$backupName}.tar.gz";
    }

    public function failed(Throwable $exception): void
    {
        app(BackupService::class)->failBackup($this->backup, $exception->getMessage());
    }
}
