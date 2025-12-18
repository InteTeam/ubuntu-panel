<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Server;
use App\Models\User;

final class ServerPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Server $server): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'operator'], true);
    }

    public function update(User $user, Server $server): bool
    {
        return in_array($user->role, ['admin', 'operator'], true);
    }

    public function delete(User $user, Server $server): bool
    {
        return $user->role === 'admin';
    }

    public function manage(User $user, Server $server): bool
    {
        return in_array($user->role, ['admin', 'operator'], true);
    }
}
