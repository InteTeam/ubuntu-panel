<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class BackupDestination extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = [
        'name',
        'type',
        'credentials',
        'is_default',
    ];

    protected $hidden = [
        'credentials',
    ];

    protected function casts(): array
    {
        return [
            'credentials' => 'encrypted:array',
            'is_default' => 'boolean',
        ];
    }

    public function backups(): HasMany
    {
        return $this->hasMany(Backup::class, 'destination_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(BackupSchedule::class, 'destination_id');
    }
}
