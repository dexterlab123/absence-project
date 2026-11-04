<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Liste des Absences</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; }
        .header { display: table; width: 100%; margin-bottom: 20px; border-bottom: 2px solid #0055A4; padding-bottom: 10px; }
        .logo { display: table-cell; width: 100px; vertical-align: middle; }
        .title { display: table-cell; text-align: right; vertical-align: middle; font-size: 18px; font-weight: bold; color: #0055A4; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        .table th { background-color: #0055A4; color: white; }
        .status-unresolved { color: #c62828; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <strong style="font-size: 24px; color: #0055A4;">OFPPT</strong>
        </div>
        <div class="title">
            Liste Principale des Absences<br>
            <small style="font-size: 12px; font-weight: normal; color: #666;">Généré le {{ date('d/m/Y') }}</small>
        </div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Code</th>
                <th>Nom & Prénom</th>
                <th>Groupe</th>
                <th style="text-align: center;">Total Absences</th>
                <th style="text-align: center;">Sans Billet</th>
            </tr>
        </thead>
        <tbody>
            @forelse($students as $student)
                <tr>
                    <td>{{ $student->student_number ?? '—' }}</td>
                    <td>{{ $student->full_name }}</td>
                    <td>{{ optional($student->enrollments->first()->group)->name ?? '—' }}</td>
                    <td style="text-align: center;">{{ $student->total_absences_count }}</td>
                    <td style="text-align: center;" class="{{ $student->unresolved_absences_count > 0 ? 'status-unresolved' : '' }}">
                        {{ $student->unresolved_absences_count }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; color: #666;">Aucun stagiaire trouvé.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
