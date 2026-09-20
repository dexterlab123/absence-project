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
            'attendance.*.justified' => 'boolean',
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
                        'justified' => $entry['justified'] ?? false,
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

        return back()->with('success', 'Attendance saved successfully.');
    }

    public function update(Request $request, Absence $absence)
    {
        Gate::authorize('update', $absence);

        $validated = $request->validate([
            'justified' => 'required|boolean',
            'justification_note' => 'nullable|string|max:1000',
        ]);

        $absence->update($validated);

        return back()->with('success', 'Absence updated.');
    }
}
