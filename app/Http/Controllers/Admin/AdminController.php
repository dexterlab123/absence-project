<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function accounts()
    {
        $formateurs = User::role('formateur')->with('groups.academicYear')->get();
        $surveillants = User::role('surveillant')->get();
        $groups = Group::with('academicYear')->get();

        return Inertia::render('Admin/Accounts/Index', [
            'formateurs' => $formateurs,
            'surveillants' => $surveillants,
            'groups' => $groups,
        ]);
    }
}
