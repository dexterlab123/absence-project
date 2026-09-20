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
            ->when($request->user()->hasRole('professor'), function ($q) use ($request) {
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

        $recentSessions = Session::with(['group', 'professor'])
            ->when($request->user()->hasRole('professor'), function ($q) use ($request) {
                $q->where('professor_id', $request->user()->id);
            })
            ->orderByDesc('date')
            ->orderByDesc('start_time')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'totalGroups' => $totalGroups,
                'todaySessions' => $todaySessions,
                'totalAbsences' => $totalAbsences,
                'totalSessions' => $totalSessionsCount,
            ],
            'recentSessions' => $recentSessions,
            'currentYear' => $currentYear,
        ]);
    }
}
