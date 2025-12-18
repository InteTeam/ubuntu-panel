<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Server extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = [
        'name',
        'host',
        'port',
        'username',
        'ssh_private_key',
        'ssh_public_key',
        'agent_token',
        'agent_port',
        'status',
        'last_seen_at',
        'os_version',
        'cpu_cores',
        'ram_mb',
        'disk_gb',
        'hardened_at',
        'security_score',
    ];

    protected $hidden = [
        'ssh_private_key',
        'agent_token',
    ];

    protected function casts(): array
    {
        return [
            'ssh_private_key' => 'encrypted',
            'port' => 'integer',
            'agent_port' => 'integer',
            'cpu_cores' => 'integer',
            'ram_mb' => 'integer',
            'disk_gb' => 'integer',
            'security_score' => 'integer',
            'last_seen_at' => 'datetime',
            'hardened_at' => 'datetime',
        ];
    }

    public function apps(): HasMany
    {
        return $this->hasMany(App::class);
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(ServerMetric::class);
    }

    public function isOnline(): bool
    {
        return $this->status === 'online';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isOffline(): bool
    {
        if (!$this->last_seen_at) {
            return false;
        }

        return $this->last_seen_at->lt(now()->subMinutes(5));
    }
}
