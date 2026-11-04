<?php

namespace App\Policies;

use App\Models\Absence;
use App\Models\User;

class AbsencePolicy
{
    public function view(User $user, Absence $absence): bool
    {
        if ($user->hasRole('admin') || $user->hasRole('surveillant')) {
            return true;
        }

        return $absence->session->professor_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('formateur');
    }

    public function update(User $user, Absence $absence): bool
    {
        if ($user->hasRole('admin') || $user->hasRole('surveillant')) {
            return true;
        }

        return $absence->session->professor_id === $user->id;
    }

    public function issueBillet(User $user, Absence $absence): bool
    {
        return $user->hasRole('admin') || $user->hasRole('surveillant');
    }
}
