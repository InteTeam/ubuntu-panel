<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\GitCredential;
use App\Models\User;

final class GitCredentialPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GitCredential $credential): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'operator']);
    }

    public function update(User $user, GitCredential $credential): bool
    {
        return in_array($user->role, ['admin', 'operator']);
    }

    public function delete(User $user, GitCredential $credential): bool
    {
        return $user->role === 'admin';
    }
}
