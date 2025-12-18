<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class App extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = [
        'server_id',
        'name',
        'git_repository',
        'git_branch',
        'git_credentials_id',
        'deploy_path',
        'docker_compose_file',
        'env_vars',
        'env_production',
        'env_staging',
        'primary_domain',
        'staging_domain',
        'status',
        'current_commit',
    ];

    protected function casts(): array
    {
        return [
            'env_vars' => 'encrypted:array',
            'env_production' => 'encrypted:array',
            'env_staging' => 'encrypted:array',
        ];
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function gitCredential(): BelongsTo
    {
        return $this->belongsTo(GitCredential::class, 'git_credentials_id');
    }

    public function deployments(): HasMany
    {
        return $this->hasMany(Deployment::class);
    }

    public function domains(): HasMany
    {
        return $this->hasMany(Domain::class);
    }

    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    public function isDeploying(): bool
    {
        return $this->status === 'deploying';
    }

    public function latestDeployment(): ?Deployment
    {
        return $this->deployments()->latest('created_at')->first();
    }
}
