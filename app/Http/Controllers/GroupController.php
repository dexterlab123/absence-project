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

        $groupsQuery = $currentYear
            ? Group::where('academic_year_id', $currentYear->id)
                ->withCount('enrollments')
                ->withCount('sessions')
            : null;

        if ($groupsQuery && request()->user()->hasRole('formateur')) {
            $groupsQuery->whereHas('formateurs', function ($q) {
                $q->where('users.id', request()->user()->id);
            });
        }

        return Inertia::render('Groups/Index', [
            'groups' => $groupsQuery ? $groupsQuery->get() : collect(),
            'currentYear' => $currentYear,
        ]);
    }

    public function store(Request $request)
    {
        $currentYear = AcademicYear::current()->first();
        if (!$currentYear) {
            return back()->withErrors(['error' => 'Aucune année scolaire en cours.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:groups,name,NULL,id,academic_year_id,' . $currentYear->id,
        ]);

        Group::create([
            'name' => $validated['name'],
            'academic_year_id' => $currentYear->id,
        ]);

        return back()->with('success', 'Groupe créé avec succès.');
    }

    public function show(Group $group)
    {
        if (request()->user()->hasRole('formateur') && !$group->formateurs()->where('users.id', request()->user()->id)->exists()) {
            abort(403, 'Vous n\'êtes pas affecté à ce groupe.');
        }

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
            'full_name_ar' => 'nullable|string|max:255',
            'student_number' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string|max:255',
            'cin' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $currentYear = AcademicYear::current()->first();
        if (!$currentYear) {
            return back()->withErrors(['error' => 'Aucune année scolaire en cours.']);
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
            return back()->withErrors(['error' => 'Ce stagiaire est déjà inscrit dans ce groupe.']);
        }

        Enrollment::create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'academic_year_id' => $currentYear->id,
            'joined_at' => now()->toDateString(),
        ]);

        return back()->with('success', 'Stagiaire ajouté avec succès.');
    }

    public function import(Request $request, Group $group)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, ['xlsx', 'xls', 'csv', 'xml'])) {
            return back()->withErrors(['file' => 'Type de fichier non pris en charge. Acceptés : .xlsx, .xls, .csv, .xml']);
        }

        $import = new StudentsImport($group->id);

        if ($extension === 'xml') {
            // Parse XML with SimpleXMLElement
            $xmlContent = file_get_contents($file->getRealPath());
            $xml = new \SimpleXMLElement($xmlContent);

            $rows = [];
            foreach ($xml->children() as $record) {
                $row = [];
                foreach ($record->children() as $field) {
                    $row[$field->getName()] = (string) $field;
                }
                $rows[] = $row;
            }

            $import->importFromArray($rows);
        } else {
            Excel::import($import, $file);
        }

        return back()->with('importSummary', $import->getSummary());
    }
}
