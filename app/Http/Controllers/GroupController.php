<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Group;
use App\Models\Student;
use App\Imports\StudentsImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class GroupController extends Controller
{
    public function index()
    {
        $currentYear = AcademicYear::current()->first();

        $groups = $currentYear
            ? Group::where('academic_year_id', $currentYear->id)
                ->withCount('enrollments')
                ->withCount('sessions')
                ->get()
            : collect();

        return Inertia::render('Groups/Index', [
            'groups' => $groups,
            'currentYear' => $currentYear,
        ]);
    }

    public function show(Group $group)
    {
        $group->load(['academicYear', 'sessions.professor']);

        $students = $group->students()
            ->withPivot(['joined_at', 'left_at'])
            ->withCount('absences')
            ->get();

        return Inertia::render('Groups/Show', [
            'group' => $group,
            'students' => $students,
            'sessions' => $group->sessions()->with('professor')->orderByDesc('date')->get(),
        ]);
    }

    public function addStudent(Request $request, Group $group)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'student_number' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
        ]);

        $currentYear = AcademicYear::current()->first();
        if (!$currentYear) {
            return back()->withErrors(['error' => 'No current academic year set.']);
        }

        // Find or create the student
        $student = null;
        if (!empty($validated['student_number'])) {
            $student = Student::where('student_number', $validated['student_number'])->first();
        }

        if (!$student) {
            $student = Student::create($validated);
        }

        // Check for existing enrollment
        $exists = Enrollment::where([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'academic_year_id' => $currentYear->id,
        ])->exists();

        if ($exists) {
            return back()->withErrors(['error' => 'Student is already enrolled in this group.']);
        }

        Enrollment::create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'academic_year_id' => $currentYear->id,
            'joined_at' => now()->toDateString(),
        ]);

        return back()->with('success', 'Student added successfully.');
    }

    public function import(Request $request, Group $group)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        $import = new StudentsImport($group->id);
        Excel::import($import, $request->file('file'));

        return back()->with('importSummary', $import->getSummary());
    }
}
