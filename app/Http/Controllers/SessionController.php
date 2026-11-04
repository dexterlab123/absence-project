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
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('formateur') && !$user->hasRole('admin')) {
            abort(403);
        }

        $sessionsQuery = Session::with('group.academicYear')
            ->withCount('absences');

        if ($user->hasRole('formateur')) {
            $sessionsQuery->where('professor_id', $user->id);
        }

        $sessions = $sessionsQuery->orderByDesc('date')->orderByDesc('start_time')->get();

        return Inertia::render('Sessions/Index', [
            'sessions' => $sessions,
        ]);
    }

    public function create(Request $request)
    {
        $groupId = $request->query('group_id');
        $group = null;
        $groups = [];
        $professors = [];

        if ($groupId) {
            $group = Group::findOrFail($groupId);
            if (request()->user()->hasRole('formateur') && !$group->formateurs()->where('users.id', request()->user()->id)->exists()) {
                abort(403, 'Vous n\'êtes pas affecté à ce groupe.');
            }
            $professors = $group->formateurs()->get(['users.id', 'name', 'email']);
            $group->load('academicYear');
        } else {
            // Need to select a group
            $user = request()->user();
            if ($user->hasRole('admin')) {
                $groups = Group::with('academicYear')->get();
                $professors = User::role('formateur')->get(['users.id', 'name', 'email']);
            } else {
                $groups = $user->groups()->with('academicYear')->get();
                $professors = [['id' => $user->id, 'name' => $user->name, 'email' => $user->email]];
            }
        }

        return Inertia::render('Sessions/Create', [
            'group' => $group,
            'groups' => $groups,
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
            ->with('success', 'Séance créée avec succès.');
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
