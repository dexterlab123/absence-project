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
            'absences.billet.issuedBy',
            'enrollments.group.academicYear',
        ]);

        $totalAbsences = $student->absences->count();
        $withBillet = $student->absences->whereNotNull('billet_id')->count();
        $withoutBillet = $totalAbsences - $withBillet;

        return Inertia::render('Students/Show', [
            'student' => $student,
            'absences' => $student->absences->sortByDesc(function ($absence) {
                return $absence->session->date;
            })->values(),
            'stats' => [
                'total' => $totalAbsences,
                'withBillet' => $withBillet,
                'withoutBillet' => $withoutBillet,
            ],
        ]);
    }

    public function importAll(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:20480', // Allow up to 20MB for large roster files
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, ['xlsx', 'xls', 'csv', 'xml'])) {
            return back()->withErrors(['file' => 'Unsupported file type. Accepted: .xlsx, .xls, .csv, .xml']);
        }

        $import = new \App\Imports\FullRosterImport();

        if ($extension === 'xml') {
            // Parse XML with SimpleXMLElement
            $xmlContent = file_get_contents($file->getRealPath());
            $xml = new \SimpleXMLElement($xmlContent);

            $rows = [];
            foreach ($xml->children() as $record) {
                $row = [];
                foreach ($record->children() as $field) {
                    $row[strtolower($field->getName())] = (string) $field;
                }
                $rows[] = $row;
            }

            $import->importFromArray($rows);
        } else {
            \Maatwebsite\Excel\Facades\Excel::import($import, $file);
        }

        return back()->with('importSummary', $import->getSummary());
    }
}
