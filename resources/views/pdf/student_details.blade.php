<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Détails Stagiaire</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; }
        .page-break { page-break-after: always; }
        .header { display: table; width: 100%; margin-bottom: 20px; border-bottom: 2px solid #0055A4; padding-bottom: 10px; }
        .logo { display: table-cell; width: 100px; vertical-align: middle; }
        .title { display: table-cell; text-align: right; vertical-align: middle; font-size: 18px; font-weight: bold; color: #0055A4; }
        .info-section { margin-bottom: 20px; }
        .info-section h3 { margin: 0 0 5px 0; font-size: 14px; }
        .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .info-table th { text-align: left; background: #f0f0f0; padding: 5px; border: 1px solid #ccc; width: 25%; }
        .info-table td { padding: 5px; border: 1px solid #ccc; }
        .stats-container { width: 100%; display: table; margin-bottom: 20px; }
        .stat-card { display: table-cell; width: 33%; text-align: center; border: 1px solid #ddd; padding: 10px; background: #fafafa; }
        .stat-card h4 { margin: 0 0 10px 0; font-size: 12px; color: #666; }
        .stat-card span { font-size: 18px; font-weight: bold; color: #0055A4; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        .table th { background-color: #0055A4; color: white; }
        .status-badge { padding: 2px 5px; border-radius: 3px; font-size: 10px; font-weight: bold; }
        .status-unresolved { background-color: #ffebee; color: #c62828; }
        .status-resolved { background-color: #e8f5e9; color: #2e7d32; }
    </style>
</head>
<body>
    @foreach($students as $index => $student)
        <div class="header">
            <div class="logo">
                <strong style="font-size: 24px; color: #0055A4;">OFPPT</strong>
            </div>
            <div class="title">
                Fiche de Détails d'Absences<br>
                <small style="font-size: 12px; font-weight: normal; color: #666;">Généré le {{ date('d/m/Y') }}</small>
            </div>
        </div>

        <div class="info-section">
            <table class="info-table">
                <tr>
                    <th>Code Stagiaire</th>
                    <td>{{ $student->student_number ?? '—' }}</td>
                    <th>Nom & Prénom</th>
                    <td>{{ $student->full_name }}</td>
                </tr>
                <tr>
                    <th>Groupe</th>
                    <td colspan="3">{{ optional($student->enrollments->first()->group)->name ?? '—' }}</td>
                </tr>
            </table>
        </div>

        @php
            $absences = $student->absences->where('category', 'Absence');
            $retards = $student->absences->where('category', 'Retard');
            $sansBillet = $student->absences->where('billet', false);
        @endphp

        <div class="stats-container">
            <div class="stat-card">
                <h4>Total Absences</h4>
                <span>{{ $absences->count() }}</span>
            </div>
            <div class="stat-card" style="border-left: none; border-right: none;">
                <h4>Total Retards</h4>
                <span>{{ $retards->count() }}</span>
            </div>
            <div class="stat-card">
                <h4>Sans Billet (Non régularisé)</h4>
                <span style="color: #c62828;">{{ $sansBillet->count() }}</span>
            </div>
        </div>

        <h3>Historique Détaillé</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Module</th>
                    <th>Formateur</th>
                    <th>Saisi par</th>
                    <th>Statut</th>
                    <th>Billet par</th>
                    <th>Commentaire</th>
                </tr>
            </thead>
            <tbody>
                @forelse($student->absences->sortByDesc(fn($a) => optional($a->session)->date) as $absence)
                    <tr>
                        <td>{{ optional($absence->session)->date ? \Carbon\Carbon::parse($absence->session->date)->format('d/m/Y') : '—' }}</td>
                        <td>{{ $absence->category }}</td>
                        <td>{{ optional($absence->session)->subject ?? '—' }}</td>
                        <td>{{ optional(optional($absence->session)->professor)->name ?? '—' }}</td>
                        <td>{{ optional($absence->marker)->name ?? '—' }}</td>
                        <td>
                            @if($absence->billet)
                                <span class="status-badge status-resolved">Régularisé</span>
                            @else
                                <span class="status-badge status-unresolved">Sans Billet</span>
                            @endif
                        </td>
                        <td>{{ optional($absence->billetIssuer)->name ?? '—' }}</td>
                        <td>{{ $absence->justification_note ?? '—' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" style="text-align: center; color: #666;">Aucune absence enregistrée.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        @if(!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>
</html>
