<?php

namespace App\Policies;

use App\Models\User;

class StudentPolicy
{
    public function importAll(User $user): bool
    {
        return $user->hasRole('admin');
    }
}

