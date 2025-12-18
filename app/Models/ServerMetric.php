<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ServerMetric extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected $fillable = [
        'server_id',
        'cpu_percent',
        'ram_used_mb',
        'ram_total_mb',
        'disk_used_gb',
        'disk_total_gb',
        'network_in_bytes',
        'network_out_bytes',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'cpu_percent' => 'decimal:2',
            'ram_used_mb' => 'integer',
            'ram_total_mb' => 'integer',
            'disk_used_gb' => 'integer',
            'disk_total_gb' => 'integer',
            'network_in_bytes' => 'integer',
            'network_out_bytes' => 'integer',
            'recorded_at' => 'datetime',
        ];
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function ramPercentage(): float
    {
        if ($this->ram_total_mb === 0) {
            return 0;
        }

        return round(($this->ram_used_mb / $this->ram_total_mb) * 100, 2);
    }

    public function diskPercentage(): float
    {
        if ($this->disk_total_gb === 0) {
            return 0;
        }

        return round(($this->disk_used_gb / $this->disk_total_gb) * 100, 2);
    }
}
