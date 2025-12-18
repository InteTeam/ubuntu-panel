<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\App;
use App\Models\User;

final class AppPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, App $app): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'operator'], true);
    }

    public function update(User $user, App $app): bool
    {
        return in_array($user->role, ['admin', 'operator'], true);
    }

    public function delete(User $user, App $app): bool
    {
        return $user->role === 'admin';
    }

    public function deploy(User $user, App $app): bool
    {
        return in_array($user->role, ['admin', 'operator'], true);
    }
}
