<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class FormateurController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'matricule' => 'required|string|max:255|unique:users,matricule',
            'password' => ['required', 'confirmed', Password::defaults()],
            'group_ids' => 'array',
            'group_ids.*' => 'exists:groups,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'matricule' => $validated['matricule'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('formateur');

        if (!empty($validated['group_ids'])) {
            $user->groups()->sync($validated['group_ids']);
        }

        return back()->with('success', 'Formateur créé avec succès.');
    }

    public function updateGroups(Request $request, User $formateur)
    {
        $validated = $request->validate([
            'group_ids' => 'array',
            'group_ids.*' => 'exists:groups,id',
        ]);

        $formateur->groups()->sync($validated['group_ids'] ?? []);

        return back()->with('success', 'Groupes du formateur mis à jour.');
    }

    public function destroy(User $formateur)
    {
        $formateur->delete();
        return back()->with('success', 'Formateur supprimé.');
    }
}
