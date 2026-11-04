<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && !$user->hasRole('surveillant')) {
            abort(403);
        }

        $currentYear = AcademicYear::current()->first();
        $search = $request->input('search');
        $groupId = $request->input('group_id');

        // Group-level statistics
        $groupsQuery = Group::query();
        if ($currentYear) {
            $groupsQuery->where('academic_year_id', $currentYear->id);
        }
        if ($groupId) {
            $groupsQuery->where('id', $groupId);
        }

        $groupStats = $groupsQuery->withCount([
            'students as students_count',
        ])->get()->map(function ($group) {
            $studentIds = $group->students()->pluck('students.id');

            $absencesCount = Absence::whereIn('student_id', $studentIds)
                ->where('category', 'Absence')->count();
            $retardsCount = Absence::whereIn('student_id', $studentIds)
                ->where('category', 'Retard')->count();
            $sansBilletCount = Absence::whereIn('student_id', $studentIds)
                ->whereNull('billet_id')->count();

            return [
                'id' => $group->id,
                'name' => $group->name,
                'students_count' => $group->students_count,
                'absences_count' => $absencesCount,
                'retards_count' => $retardsCount,
                'sans_billet_count' => $sansBilletCount,
            ];
        });

        // Individual student statistics
        $studentsQuery = Student::query();
        if ($currentYear) {
            $studentsQuery->whereHas('enrollments', fn($q) => $q->where('academic_year_id', $currentYear->id));
        }
        if ($groupId) {
            $studentsQuery->whereHas('enrollments', fn($q) => $q->where('group_id', $groupId));
        }
        if ($search) {
            $studentsQuery->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        $studentsQuery->with('enrollments.group');
        $studentsQuery->withCount([
            'absences as total_absences_count',
            'absences as absences_count' => fn($q) => $q->where('category', 'Absence'),
            'absences as retards_count' => fn($q) => $q->where('category', 'Retard'),
            'absences as sans_billet_count' => fn($q) => $q->whereNull('billet_id'),
        ]);

        $studentsQuery->orderByDesc('total_absences_count');

        $students = $studentsQuery->paginate(50)->withQueryString();

        $groups = $currentYear ? Group::where('academic_year_id', $currentYear->id)->get() : [];

        return Inertia::render('Statistics/Index', [
            'groupStats' => $groupStats,
            'students' => $students,
            'groups' => $groups,
            'filters' => $request->only(['search', 'group_id']),
            'currentYear' => $currentYear,
        ]);
    }

    public function topAbsences(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('admin') && !$user->hasRole('surveillant')) {
            abort(403);
        }

        $currentYear = AcademicYear::current()->first();
        $groupId = $request->input('group_id');

        $studentsQuery = Student::query();
        if ($currentYear) {
            $studentsQuery->whereHas('enrollments', fn($q) => $q->where('academic_year_id', $currentYear->id));
        }
        if ($groupId) {
            $studentsQuery->whereHas('enrollments', fn($q) => $q->where('group_id', $groupId));
        }

        $studentsQuery->with('enrollments.group');
        $studentsQuery->withCount([
            'absences as total_absences_count',
            'absences as sans_billet_count' => fn($q) => $q->whereNull('billet_id'),
        ]);

        $studentsQuery->orderByDesc('total_absences_count')
                      ->orderByDesc('sans_billet_count')
                      ->limit(10);

        $topStudents = $studentsQuery->get();

        $groups = $currentYear ? Group::where('academic_year_id', $currentYear->id)->get() : [];

        return Inertia::render('Statistics/TopAbsences', [
            'topStudents' => $topStudents,
            'groups' => $groups,
            'filters' => $request->only(['group_id']),
            'currentYear' => $currentYear,
        ]);
    }
}
