<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Backup;
use App\Models\User;

final class BackupPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Backup $backup): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'operator']);
    }

    public function delete(User $user, Backup $backup): bool
    {
        return $user->role === 'admin';
    }
}
