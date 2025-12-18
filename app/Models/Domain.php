<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Domain extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = [
        'app_id',
        'server_id',
        'domain',
        'environment',
        'ssl_enabled',
        'ssl_auto_renew',
        'ssl_expires_at',
        'upstream_port',
        'status',
        'caddy_configured',
    ];

    protected function casts(): array
    {
        return [
            'ssl_enabled' => 'boolean',
            'ssl_auto_renew' => 'boolean',
            'caddy_configured' => 'boolean',
            'ssl_expires_at' => 'datetime',
            'upstream_port' => 'integer',
        ];
    }

    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class);
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
