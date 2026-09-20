<?php

namespace App\Imports;

use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

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

            $fullName = trim($row['full_name'] ?? '');
            $studentNumber = trim($row['student_number'] ?? '');

            // Skip rows with no name
            if (empty($fullName)) {
                $this->summary['skipped'][] = [
                    'row' => $rowNumber,
                    'reason' => 'Missing full_name',
                ];
                continue;
            }

            // Find or create student
            $isNew = false;
            if (!empty($studentNumber)) {
                $student = Student::where('student_number', $studentNumber)->first();
                if ($student) {
                    // Existing student found by student_number
                    $isNew = false;
                } else {
                    $student = Student::create([
                        'full_name' => $fullName,
                        'student_number' => $studentNumber,
                    ]);
                    $isNew = true;
                }
            } else {
                // No student number — create new
                $student = Student::create([
                    'full_name' => $fullName,
                    'student_number' => null,
                ]);
                $isNew = true;
            }

            // Check if enrollment already exists
            $existingEnrollment = Enrollment::where([
                'student_id' => $student->id,
                'group_id' => $this->groupId,
                'academic_year_id' => $this->academicYear->id,
            ])->exists();

            if ($existingEnrollment) {
                $this->summary['skipped'][] = [
                    'row' => $rowNumber,
                    'reason' => "Student \"{$fullName}\" already enrolled in this group",
                ];
                continue;
            }

            // Create enrollment
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
    }

    public function getSummary(): array
    {
        return $this->summary;
    }
}
