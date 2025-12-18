<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\BackupDestination;
use App\Models\User;

final class BackupDestinationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, BackupDestination $destination): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'operator']);
    }

    public function update(User $user, BackupDestination $destination): bool
    {
        return in_array($user->role, ['admin', 'operator']);
    }

    public function delete(User $user, BackupDestination $destination): bool
    {
        return $user->role === 'admin';
    }
}
