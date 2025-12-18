<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class GitCredential extends Model
{
    use HasFactory;
    use HasUlids;

    protected $fillable = [
        'name',
        'type',
        'credentials',
    ];

    protected $hidden = [
        'credentials',
    ];

    protected function casts(): array
    {
        return [
            'credentials' => 'encrypted:array',
        ];
    }

    public function apps(): HasMany
    {
        return $this->hasMany(App::class, 'git_credentials_id');
    }
}
