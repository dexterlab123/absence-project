<?php

namespace App\Policies;

use App\Models\Session;
use App\Models\User;

class SessionPolicy
{
    /**
     * Admin can do anything. Professor can only manage their own sessions.
     */
    public function markAttendance(User $user, Session $session): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $session->professor_id === $user->id;
    }

    public function viewAttendance(User $user, Session $session): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $session->professor_id === $user->id;
    }
}
