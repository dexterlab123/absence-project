<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;

class GroupPolicy
{
    /**
     * Determine whether the user can create groups.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can add students or import group rosters.
     */
    public function manageStudents(User $user, Group $group): bool
    {
        if ($user->hasRole('admin') || $user->hasRole('surveillant')) {
            return true;
        }

        return $user->hasRole('formateur') && $group->formateurs()->where('users.id', $user->id)->exists();
    }
}

