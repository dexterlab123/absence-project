<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function show(Student $student)
    {
        $student->load([
            'absences.session.group',
            'absences.session.professor',
            'enrollments.group.academicYear',
        ]);

        $totalAbsences = $student->absences->count();
        $justifiedAbsences = $student->absences->where('justified', true)->count();
        $unjustifiedAbsences = $totalAbsences - $justifiedAbsences;

        return Inertia::render('Students/Show', [
            'student' => $student,
            'absences' => $student->absences->sortByDesc(function ($absence) {
                return $absence->session->date;
            })->values(),
            'stats' => [
                'total' => $totalAbsences,
                'justified' => $justifiedAbsences,
                'unjustified' => $unjustifiedAbsences,
            ],
        ]);
    }
}
