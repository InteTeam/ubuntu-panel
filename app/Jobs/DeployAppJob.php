<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Deployment;
use App\Services\DeploymentService;
use App\Services\GitService;
use App\Services\SshService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

final class DeployAppJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 1;
    public int $timeout = 600; // 10 minutes

    public function __construct(
        public Deployment $deployment,
    ) {
        $this->onQueue('deployments');
    }

    public function handle(
        SshService $sshService,
        GitService $gitService,
        DeploymentService $deploymentService,
    ): void {
        $deployment = $this->deployment;
        $app = $deployment->app;
        $server = $app->server;

        $deploymentService->start($deployment);

        try {
            $deployment->appendLog('Connecting to server...');
            $ssh = $sshService->connect(
                $server->host,
                $server->port,
                $server->username,
                decrypt($server->ssh_private_key)
            );

            // Clone or pull
            if ($deployment->is_rollback) {
                $deployment->appendLog("Rolling back to commit {$deployment->commit_hash}...");
                $output = $gitService->checkout($ssh, $app, $deployment->commit_hash);
            } else {
                $deployment->appendLog('Pulling latest code...');
                
                $repoExists = trim($sshService->execute($ssh, "test -d {$app->deploy_path}/.git && echo 'yes' || echo 'no'"));
                
                if ($repoExists === 'yes') {
                    $output = $gitService->pull($ssh, $app);
                } else {
                    $deployment->appendLog('Cloning repository...');
                    $output = $gitService->clone($ssh, $app);
                }
                
                $deployment->appendLog($output);
            }

            // Get commit info
            $commit = $gitService->getLatestCommit($ssh, $app);
            $deployment->update([
                'commit_hash' => $commit['hash'],
                'commit_message' => $commit['message'],
            ]);

            // Generate .env file
            $deployment->appendLog('Generating environment file...');
            $envVars = $deployment->environment === 'production'
                ? ($app->env_production ?? [])
                : ($app->env_staging ?? []);

            $envContent = $this->generateEnvFile($envVars);
            $sshService->execute($ssh, "cat > {$app->deploy_path}/.env << 'ENVEOF'\n{$envContent}\nENVOF");

            // Docker compose build and up
            $deployment->appendLog('Building containers...');
            $buildOutput = $sshService->execute($ssh, "cd {$app->deploy_path} && docker compose -f {$app->docker_compose_file} build 2>&1");
            $deployment->appendLog($buildOutput);

            $deployment->appendLog('Starting containers...');
            $upOutput = $sshService->execute($ssh, "cd {$app->deploy_path} && docker compose -f {$app->docker_compose_file} up -d 2>&1");
            $deployment->appendLog($upOutput);

            // Health check
            $deployment->appendLog('Running health check...');
            sleep(5); // Wait for containers to start
            $psOutput = $sshService->execute($ssh, "cd {$app->deploy_path} && docker compose -f {$app->docker_compose_file} ps --format json 2>&1");
            $deployment->appendLog($psOutput);

            $ssh->disconnect();

            $deployment->appendLog('Deployment completed successfully!');
            $deploymentService->succeed($deployment);

        } catch (Throwable $e) {
            $deploymentService->fail($deployment, $e->getMessage());
            throw $e;
        }
    }

    private function generateEnvFile(array $envVars): string
    {
        $lines = [];
        foreach ($envVars as $key => $value) {
            $escapedValue = str_replace('"', '\"', $value);
            $lines[] = "{$key}=\"{$escapedValue}\"";
        }

        return implode("\n", $lines);
    }

    public function failed(Throwable $exception): void
    {
        app(DeploymentService::class)->fail($this->deployment, $exception->getMessage());
    }
}
