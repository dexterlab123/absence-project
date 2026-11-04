<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\Session;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $currentYear = AcademicYear::current()->first();

        $totalStudents = $currentYear
            ? Student::whereHas('enrollments', fn ($q) => $q->where('academic_year_id', $currentYear->id))->count()
            : 0;

        $totalGroups = $currentYear ? Group::where('academic_year_id', $currentYear->id)->count() : 0;

        $todaySessions = Session::whereDate('date', today())
            ->when($request->user()->hasRole('formateur'), function ($q) use ($request) {
                $q->where('professor_id', $request->user()->id);
            })
            ->count();

        $totalAbsences = $currentYear
            ? Absence::whereHas('session', function ($q) use ($currentYear) {
                $q->whereHas('group', fn ($gq) => $gq->where('academic_year_id', $currentYear->id));
            })->count()
            : 0;

        $totalSessionsCount = $currentYear
            ? Session::whereHas('group', fn ($q) => $q->where('academic_year_id', $currentYear->id))->count()
            : 0;

        // Fetch students for the main list
        $search = $request->input('search');
        $groupId = $request->input('group_id');

        $studentsQuery = clone (new Student)->newQuery();

        if ($currentYear) {
            $studentsQuery->whereHas('enrollments', fn($q) => $q->where('academic_year_id', $currentYear->id));
        }

        if ($search) {
            $studentsQuery->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        if ($groupId) {
            $studentsQuery->whereHas('enrollments', fn($q) => $q->where('group_id', $groupId));
        }

        $studentsQuery->with([
            'enrollments.group',
            'absences' => function ($q) {
                $q->whereNull('billet_id')->with('session:id,date');
            }
        ]);

        $studentsQuery->withCount([
            'absences as total_absences_count',
            'absences as unresolved_absences_count' => function ($query) {
                $query->whereNull('billet_id');
            }
        ]);

        $studentsQuery->orderByDesc('unresolved_absences_count')
                      ->orderBy('full_name');

        $students = $studentsQuery->paginate(50)->withQueryString();

        $groups = $currentYear ? Group::where('academic_year_id', $currentYear->id)->get() : [];

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'totalGroups' => $totalGroups,
                'todaySessions' => $todaySessions,
                'totalAbsences' => $totalAbsences,
                'totalSessions' => $totalSessionsCount,
            ],
            'students' => $students,
            'groups' => $groups,
            'filters' => $request->only(['search', 'group_id']),
            'currentYear' => $currentYear,
        ]);
    }
}
