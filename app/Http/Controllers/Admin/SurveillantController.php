<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SurveillantController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'matricule' => 'required|string|max:255|unique:users,matricule',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'matricule' => $validated['matricule'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('surveillant');

        return back()->with('success', 'Surveillant créé avec succès.');
    }

    public function destroy(User $surveillant)
    {
        $surveillant->delete();
        return back()->with('success', 'Surveillant supprimé.');
    }
}
