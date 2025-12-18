<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Deployment extends Model
{
    use HasFactory;
    use HasUlids;

    public $timestamps = false;

    protected $fillable = [
        'app_id',
        'user_id',
        'commit_hash',
        'commit_message',
        'branch',
        'environment',
        'status',
        'started_at',
        'finished_at',
        'duration_seconds',
        'log',
        'error_message',
        'is_rollback',
        'rollback_from_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'created_at' => 'datetime',
            'duration_seconds' => 'integer',
            'is_rollback' => 'boolean',
        ];
    }

    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rollbackFrom(): BelongsTo
    {
        return $this->belongsTo(self::class, 'rollback_from_id');
    }

    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    public function isSuccess(): bool
    {
        return $this->status === 'success';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function appendLog(string $message): void
    {
        $this->log = ($this->log ?? '') . "[" . now()->format('H:i:s') . "] {$message}\n";
        $this->save();
    }
}
