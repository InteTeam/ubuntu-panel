<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class BackupSchedule extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = [
        'app_id',
        'destination_id',
        'name',
        'type',
        'cron_expression',
        'retention_count',
        'is_active',
        'last_run_at',
        'next_run_at',
    ];

    protected function casts(): array
    {
        return [
            'retention_count' => 'integer',
            'is_active' => 'boolean',
            'last_run_at' => 'datetime',
            'next_run_at' => 'datetime',
        ];
    }

    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class);
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(BackupDestination::class, 'destination_id');
    }

    public function backups(): HasMany
    {
        return $this->hasMany(Backup::class, 'schedule_id');
    }

    public function isDue(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if (!$this->next_run_at) {
            return true;
        }

        return $this->next_run_at->lte(now());
    }
}
