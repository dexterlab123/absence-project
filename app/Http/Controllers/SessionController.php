<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\Session;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class SessionController extends Controller
{
    public function create(Group $group)
    {
        $professors = User::role('professor')->get(['id', 'name', 'email']);

        return Inertia::render('Sessions/Create', [
            'group' => $group->load('academicYear'),
            'professors' => $professors,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'group_id' => 'required|exists:groups,id',
            'subject' => 'required|string|max:255',
            'professor_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $session = Session::create($validated);

        return redirect()->route('sessions.show', $session)
            ->with('success', 'Session created successfully.');
    }

    public function show(Session $session)
    {
        Gate::authorize('viewAttendance', $session);

        $session->load(['group.academicYear', 'professor']);

        // Get all enrolled students for this group
        $students = $session->group->students()
            ->withPivot(['joined_at'])
            ->get()
            ->map(function ($student) use ($session) {
                $absence = $session->absences()->where('student_id', $student->id)->first();
                $student->absence = $absence;
                $student->is_absent = $absence !== null;
                return $student;
            });

        return Inertia::render('Sessions/Show', [
            'session' => $session,
            'students' => $students,
        ]);
    }
}
