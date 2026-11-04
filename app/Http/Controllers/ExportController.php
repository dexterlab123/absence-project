<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Group;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    public function studentDetails(Request $request)
    {
        $studentIds = $request->input('student_ids', []);
        
        if (empty($studentIds)) {
            return back()->with('error', 'Aucun stagiaire sélectionné.');
        }

        $students = Student::with([
            'enrollments.group',
            'absences.session.group',
            'absences.session.professor',
            'absences.markedBy',
            'absences.billet.issuedBy'
        ])->whereIn('id', $studentIds)->get();

        $pdf = Pdf::loadView('pdf.student_details', compact('students'));
        
        return $pdf->download('fiches_stagiaires.pdf');
    }

    public function absenceList(Request $request)
    {
        $studentIds = $request->input('student_ids', []);
        $currentYear = AcademicYear::current()->first();
        
        $studentsQuery = clone (new Student)->newQuery();

        if (!empty($studentIds)) {
            $studentsQuery->whereIn('id', $studentIds);
        } else {
            $search = $request->input('search');
            $groupId = $request->input('group_id');

            if ($currentYear) {
                $studentsQuery->whereHas('enrollments', fn($q) => $q->where('academic_year_id', $currentYear->id));
            }
            if ($search) {
                $studentsQuery->where(function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('student_number', 'like', "%{$search}%");
                });
            }
            if ($groupId) {
                $studentsQuery->whereHas('enrollments', fn($q) => $q->where('group_id', $groupId));
            }
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

        $students = $studentsQuery->get();

        $pdf = Pdf::loadView('pdf.absence_list', compact('students'));
        $pdf->setPaper('a4', 'landscape');
        
        return $pdf->download('liste_absences.pdf');
    }
}
