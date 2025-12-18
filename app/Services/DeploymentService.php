<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\DeployAppJob;
use App\Models\App;
use App\Models\Deployment;
use App\Models\User;
use Illuminate\Support\Facades\Log;

final class DeploymentService
{
    public function createDeployment(App $app, User $user, string $environment = 'production'): Deployment
    {
        $deployment = Deployment::create([
            'app_id' => $app->id,
            'user_id' => $user->id,
            'commit_hash' => 'pending',
            'commit_message' => 'Deployment queued...',
            'branch' => $app->git_branch,
            'environment' => $environment,
            'status' => 'queued',
            'created_at' => now(),
        ]);

        Log::info('Deployment created', [
            'deployment_id' => $deployment->id,
            'app_id' => $app->id,
            'environment' => $environment,
        ]);

        DeployAppJob::dispatch($deployment);

        return $deployment;
    }

    public function createRollback(App $app, User $user, Deployment $fromDeployment): Deployment
    {
        $deployment = Deployment::create([
            'app_id' => $app->id,
            'user_id' => $user->id,
            'commit_hash' => $fromDeployment->commit_hash,
            'commit_message' => "Rollback to {$fromDeployment->commit_hash}",
            'branch' => $fromDeployment->branch,
            'environment' => $fromDeployment->environment,
            'status' => 'queued',
            'is_rollback' => true,
            'rollback_from_id' => $fromDeployment->id,
            'created_at' => now(),
        ]);

        Log::info('Rollback deployment created', [
            'deployment_id' => $deployment->id,
            'rollback_from' => $fromDeployment->id,
        ]);

        DeployAppJob::dispatch($deployment);

        return $deployment;
    }

    public function start(Deployment $deployment): void
    {
        $deployment->update([
            'status' => 'running',
            'started_at' => now(),
        ]);

        $deployment->app->update(['status' => 'deploying']);
    }

    public function succeed(Deployment $deployment): void
    {
        $finishedAt = now();

        $deployment->update([
            'status' => 'success',
            'finished_at' => $finishedAt,
            'duration_seconds' => $deployment->started_at
                ? $finishedAt->diffInSeconds($deployment->started_at)
                : 0,
        ]);

        $deployment->app->update([
            'status' => 'running',
            'current_commit' => $deployment->commit_hash,
        ]);
    }

    public function fail(Deployment $deployment, string $errorMessage): void
    {
        $finishedAt = now();

        $deployment->update([
            'status' => 'failed',
            'finished_at' => $finishedAt,
            'duration_seconds' => $deployment->started_at
                ? $finishedAt->diffInSeconds($deployment->started_at)
                : 0,
            'error_message' => $errorMessage,
        ]);

        $deployment->app->update(['status' => 'failed']);

        Log::error('Deployment failed', [
            'deployment_id' => $deployment->id,
            'error' => $errorMessage,
        ]);
    }

    public function cancel(Deployment $deployment): void
    {
        if ($deployment->status !== 'queued') {
            return;
        }

        $deployment->update(['status' => 'cancelled']);
    }
}
