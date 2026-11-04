<?php

namespace App\Policies;

use App\Models\Session;
use App\Models\User;

class SessionPolicy
{
    /**
     * Admin can do anything. Formateur can only manage their own sessions.
     */
    public function markAttendance(User $user, Session $session): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('formateur') && $user->groups()->where('groups.id', $session->group_id)->exists();
    }

    public function viewAttendance(User $user, Session $session): bool
    {
        if ($user->hasRole('admin') || $user->hasRole('surveillant')) {
            return true;
        }

        return $user->groups()->where('groups.id', $session->group_id)->exists();
    }
}
