<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AttendanceController extends Controller
{
    /**
     * Bulk store/update attendance for a session.
     * Expects: { attendance: [{ student_id, absent: bool, justified: bool, justification_note: string|null }] }
     */
    public function store(Request $request, Session $session)
    {
        Gate::authorize('markAttendance', $session);

        $validated = $request->validate([
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.absent' => 'required|boolean',
            'attendance.*.category' => 'nullable|string|in:Absence,Retard',
            'attendance.*.justification_note' => 'nullable|string|max:1000',
        ]);

        foreach ($validated['attendance'] as $entry) {
            if ($entry['absent']) {
                Absence::updateOrCreate(
                    [
                        'student_id' => $entry['student_id'],
                        'session_id' => $session->id,
                    ],
                    [
                        'marked_by' => $request->user()->id,
                        'marked_at' => now(),
                        'category' => $entry['category'] ?? 'Absence',
                        'justification_note' => $entry['justification_note'] ?? null,
                    ]
                );
            } else {
                // If marked as present, remove any existing absence record
                Absence::where([
                    'student_id' => $entry['student_id'],
                    'session_id' => $session->id,
                ])->delete();
            }
        }

        return back()->with('success', 'Présences enregistrées avec succès.');
    }

    public function create(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('formateur') && !$user->hasRole('admin')) {
            abort(403);
        }

        $groupsQuery = $user->hasRole('admin') ? \App\Models\Group::query() : $user->groups();
        $groups = $groupsQuery->with(['students' => function($q) {
            $q->withCount(['absences as unresolved_absences_count' => function ($query) {
                $query->where('billet', false);
            }]);
        }, 'academicYear'])->get();

        return \Inertia\Inertia::render('Attendance/Mark', [
            'groups' => $groups,
        ]);
    }

    public function storeBulk(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('formateur') && !$user->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'group_id' => 'required|exists:groups,id',
            'subject' => 'required|string|max:255',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'category' => 'required|in:Absence,Retard',
            'comment' => 'nullable|string|max:1000',
            'student_ids' => 'present|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        if (!$user->hasRole('admin')) {
            if (!$user->groups()->where('groups.id', $validated['group_id'])->exists()) {
                abort(403);
            }
        }

        $session = Session::create([
            'group_id' => $validated['group_id'],
            'professor_id' => $user->id,
            'subject' => $validated['subject'],
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
        ]);

        $absencesToInsert = [];
        $now = now();
        foreach ($validated['student_ids'] as $studentId) {
            $absencesToInsert[] = [
                'student_id' => $studentId,
                'session_id' => $session->id,
                'marked_by' => $user->id,
                'marked_at' => $now,
                'category' => $validated['category'],
                'billet' => false,
                'justification_note' => $validated['comment'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (count($absencesToInsert) > 0) {
            Absence::insert($absencesToInsert);
        }

        return redirect()->route('dashboard')->with('success', count($absencesToInsert) . ' absence(s) enregistrée(s) avec succès.');
    }
}
