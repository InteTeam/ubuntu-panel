<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\App;
use App\Models\Server;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class AppService
{
    public function getAllApps(): Collection
    {
        return App::query()
            ->with(['server', 'domains'])
            ->withCount('deployments')
            ->orderBy('name')
            ->get();
    }

    public function getAppsForServer(Server $server): Collection
    {
        return App::query()
            ->where('server_id', $server->id)
            ->with('domains')
            ->withCount('deployments')
            ->orderBy('name')
            ->get();
    }

    public function getApp(string $id): App
    {
        return App::query()
            ->with(['server', 'domains', 'deployments' => fn ($q) => $q->latest('created_at')->limit(10)])
            ->findOrFail($id);
    }

    public function createApp(array $data): App
    {
        return DB::transaction(function () use ($data) {
            $app = App::create([
                'server_id' => $data['server_id'],
                'name' => $data['name'],
                'git_repository' => $data['git_repository'],
                'git_branch' => $data['git_branch'] ?? 'main',
                'git_credentials_id' => $data['git_credentials_id'] ?? null,
                'deploy_path' => $data['deploy_path'],
                'docker_compose_file' => $data['docker_compose_file'] ?? 'docker-compose.yml',
                'env_production' => $data['env_production'] ?? [],
                'env_staging' => $data['env_staging'] ?? [],
                'primary_domain' => $data['primary_domain'] ?? null,
                'staging_domain' => $data['staging_domain'] ?? null,
                'status' => 'pending',
            ]);

            Log::info('App created', ['app_id' => $app->id, 'name' => $app->name]);

            return $app;
        });
    }

    public function updateApp(App $app, array $data): App
    {
        $app->update(array_filter([
            'name' => $data['name'] ?? null,
            'git_repository' => $data['git_repository'] ?? null,
            'git_branch' => $data['git_branch'] ?? null,
            'git_credentials_id' => $data['git_credentials_id'] ?? null,
            'deploy_path' => $data['deploy_path'] ?? null,
            'docker_compose_file' => $data['docker_compose_file'] ?? null,
            'env_production' => $data['env_production'] ?? null,
            'env_staging' => $data['env_staging'] ?? null,
            'primary_domain' => $data['primary_domain'] ?? null,
            'staging_domain' => $data['staging_domain'] ?? null,
        ], fn ($v) => $v !== null));

        Log::info('App updated', ['app_id' => $app->id]);

        return $app->fresh();
    }

    public function deleteApp(App $app): void
    {
        $appId = $app->id;
        $appName = $app->name;

        $app->delete();

        Log::info('App deleted', ['app_id' => $appId, 'name' => $appName]);
    }

    public function updateStatus(App $app, string $status): void
    {
        $app->update(['status' => $status]);
    }
}
