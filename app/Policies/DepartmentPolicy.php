<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Department;
use App\Models\User;

class DepartmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Department $department): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(UserRole::Admin, UserRole::Hr);
    }

    public function update(User $user, Department $department): bool
    {
        return $user->hasRole(UserRole::Admin, UserRole::Hr);
    }

    public function delete(User $user, Department $department): bool
    {
        return $user->hasRole(UserRole::Admin, UserRole::Hr);
    }
}
