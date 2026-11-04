<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AbsenceController extends Controller
{
    public function issueBillet(Request $request, Absence $absence)
    {
        Gate::authorize('issueBillet', $absence);

        $validated = $request->validate([
            'justification_note' => 'nullable|string|max:1000',
        ]);

        $billet = \App\Models\Billet::create([
            'date' => now(),
            'motif' => $validated['justification_note'] ?? 'Régularisé',
            'issued_by' => $request->user()->id,
        ]);

        $absence->update([
            'billet_id' => $billet->id,
        ]);

        return back()->with('success', 'Billet émis avec succès.');
    }

    public function issueBilletBulk(Request $request)
    {
        if (!$request->user()->hasRole('admin') && !$request->user()->hasRole('surveillant')) {
            abort(403);
        }

        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'category' => 'required|in:Absence,Retard',
            'date' => 'required|date',
            'motif' => 'required|string',
        ]);

        // Preserve selection order by using the array order
        $studentIds = $validated['student_ids'];
        $students = \App\Models\Student::whereIn('id', $studentIds)->get()
            ->sortBy(function($model) use ($studentIds) {
                return array_search($model->id, $studentIds);
            })->values();

        $chunks = $students->chunk(4);

        $billets = [];

        foreach ($chunks as $chunk) {
            $billet = \App\Models\Billet::create([
                'date' => $validated['date'],
                'motif' => $validated['motif'],
                'issued_by' => $request->user()->id,
            ]);

            $billets[] = [
                'billet' => $billet,
                'students' => $chunk,
            ];

            foreach ($chunk as $student) {
                \App\Models\Absence::where('student_id', $student->id)
                    ->where('category', $validated['category'])
                    ->whereNull('billet_id')
                    ->update(['billet_id' => $billet->id]);
            }
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.billet_slips', compact('billets'));
        $pdf->setPaper('a6', 'landscape');
        
        return $pdf->stream('billets_entree.pdf');
    }
}
