<?php

namespace App\Imports;

use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class StudentsImport implements ToCollection, WithHeadingRow
{
    protected int $groupId;
    protected ?AcademicYear $academicYear;

    protected array $summary = [
        'created' => 0,
        'matched' => 0,
        'skipped' => [],
        'total' => 0,
    ];

    public function __construct(int $groupId)
    {
        $this->groupId = $groupId;
        $this->academicYear = AcademicYear::where('is_current', true)->first();
    }

    public function collection(Collection $rows): void
    {
        if (!$this->academicYear) {
            $this->summary['skipped'][] = [
                'row' => 0,
                'reason' => 'No current academic year found. Cannot import.',
            ];
            return;
        }

        foreach ($rows as $index => $row) {
            $this->summary['total']++;
            $rowNumber = $index + 2; // +2 because heading row is 1, data starts at 2

            $this->processRow($row, $rowNumber);
        }
    }

    protected function processRow($row, int $rowNumber): void
    {
        $matricule = trim($row['matriculeetudiant'] ?? '');
        $nom = trim($row['nom'] ?? '');
        $prenom = trim($row['prenom'] ?? '');
        $nomArabe = trim($row['nom_arabe'] ?? '');
        $prenomArabe = trim($row['prenom_arabe'] ?? '');
        $dateNaissance = trim($row['datenaissance'] ?? '');
        $lieuNaissance = trim($row['lieunaissance'] ?? '');
        $cin = trim($row['cin'] ?? '');
        
        $phoneRaw = $row['ntelelephone'] ?? '';
        $phone = '';
        if ($phoneRaw !== '') {
            $phone = (string) (int) $phoneRaw;
        }

        if (empty($nom) || empty($prenom)) {
            $this->summary['skipped'][] = [
                'row' => $rowNumber,
                'reason' => 'Missing Nom/Prenom',
            ];
            return;
        }

        $fullName = trim("{$nom} {$prenom}");
        $fullNameAr = trim("{$nomArabe} {$prenomArabe}");
        if ($fullNameAr === '') $fullNameAr = null;
        
        $birthDate = null;
        if (!empty($dateNaissance)) {
            try {
                $birthDate = Carbon::createFromFormat('d/m/Y H:i:s', $dateNaissance)->format('Y-m-d');
            } catch (\Exception $e) {
                // Ignore if date format is invalid
            }
        }

        $student = null;
        $isNew = false;

        if (!empty($matricule)) {
            $student = Student::where('student_number', $matricule)->first();
            if ($student) {
                $updateData = [];
                if (empty($student->phone) && !empty($phone)) $updateData['phone'] = $phone;
                if (empty($student->full_name_ar) && !empty($fullNameAr)) $updateData['full_name_ar'] = $fullNameAr;
                if (empty($student->birth_date) && !empty($birthDate)) $updateData['birth_date'] = $birthDate;
                if (empty($student->birth_place) && !empty($lieuNaissance)) $updateData['birth_place'] = $lieuNaissance;
                if (empty($student->cin) && !empty($cin)) $updateData['cin'] = $cin;
                
                if (!empty($updateData)) {
                    $student->update($updateData);
                }
            }
        }

        if (!$student) {
            $student = Student::create([
                'student_number' => !empty($matricule) ? $matricule : null,
                'full_name' => $fullName,
                'full_name_ar' => $fullNameAr,
                'birth_date' => $birthDate,
                'birth_place' => !empty($lieuNaissance) ? $lieuNaissance : null,
                'cin' => !empty($cin) ? $cin : null,
                'phone' => !empty($phone) ? $phone : null,
            ]);
            $isNew = true;
        }

        $existingEnrollment = Enrollment::where([
            'student_id' => $student->id,
            'group_id' => $this->groupId,
            'academic_year_id' => $this->academicYear->id,
        ])->exists();

        if ($existingEnrollment) {
            $this->summary['skipped'][] = [
                'row' => $rowNumber,
                'reason' => "Student already enrolled in this group",
            ];
            return;
        }

        Enrollment::create([
            'student_id' => $student->id,
            'group_id' => $this->groupId,
            'academic_year_id' => $this->academicYear->id,
            'joined_at' => now()->toDateString(),
        ]);

        if ($isNew) {
            $this->summary['created']++;
        } else {
            $this->summary['matched']++;
        }
    }

    public function importFromArray(array $rows): void
    {
        if (!$this->academicYear) {
            $this->summary['skipped'][] = [
                'row' => 0,
                'reason' => 'No current academic year found. Cannot import.',
            ];
            return;
        }

        foreach ($rows as $index => $row) {
            $this->summary['total']++;
            $rowNumber = $index + 2;
            $this->processRow(collect($row), $rowNumber);
        }
    }

    public function getSummary(): array
    {
        return $this->summary;
    }
}
