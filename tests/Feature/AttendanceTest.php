<?php

namespace Tests\Feature;

use App\Models\Absence;
use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\Session;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected User $formateur;
    protected Group $group;
    protected Session $session;
    protected Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'formateur']);
        Role::firstOrCreate(['name' => 'surveillant']);

        $academicYear = AcademicYear::create([
            'name' => '2026-2027',
            'is_current' => true,
        ]);

        $this->group = Group::create([
            'name' => 'DEV101',
            'academic_year_id' => $academicYear->id,
        ]);

        $this->formateur = User::factory()->create();
        $this->formateur->assignRole('formateur');
        $this->formateur->groups()->attach($this->group->id);

        $this->student = Student::create([
            'full_name' => 'Ali Bennani',
            'student_number' => 'ST1001',
        ]);

        $this->session = Session::create([
            'group_id' => $this->group->id,
            'professor_id' => $this->formateur->id,
            'subject' => 'Laravel PHP',
            'date' => '2026-11-17',
            'start_time' => '08:30',
            'end_time' => '11:00',
        ]);
    }

    public function test_can_create_absence_when_taking_attendance(): void
    {
        $response = $this->actingAs($this->formateur)
            ->post("/sessions/{$this->session->id}/attendance", [
                'attendance' => [
                    [
                        'student_id' => $this->student->id,
                        'absent' => true,
                        'category' => 'Absence',
                        'justification_note' => null,
                    ],
                ],
            ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('absences', [
            'student_id' => $this->student->id,
            'session_id' => $this->session->id,
            'marked_by' => $this->formateur->id,
            'category' => 'Absence',
        ]);
    }

    public function test_can_correct_existing_absence(): void
    {
        // First mark as absent
        Absence::create([
            'student_id' => $this->student->id,
            'session_id' => $this->session->id,
            'marked_by' => $this->formateur->id,
            'marked_at' => now(),
            'category' => 'Absence',
        ]);

        // Correct to Retard with note
        $response = $this->actingAs($this->formateur)
            ->post("/sessions/{$this->session->id}/attendance", [
                'attendance' => [
                    [
                        'student_id' => $this->student->id,
                        'absent' => true,
                        'category' => 'Retard',
                        'justification_note' => 'Arrivé avec 20 min de retard',
                    ],
                ],
            ]);

        $response->assertSessionHas('success');

        $this->assertSame(1, Absence::count());
        $this->assertDatabaseHas('absences', [
            'student_id' => $this->student->id,
            'session_id' => $this->session->id,
            'category' => 'Retard',
            'justification_note' => 'Arrivé avec 20 min de retard',
        ]);
    }

    public function test_unchecking_removes_the_absence(): void
    {
        // First create absence
        Absence::create([
            'student_id' => $this->student->id,
            'session_id' => $this->session->id,
            'marked_by' => $this->formateur->id,
            'marked_at' => now(),
            'category' => 'Absence',
        ]);

        $this->assertSame(1, Absence::count());

        // Uncheck (absent: false)
        $response = $this->actingAs($this->formateur)
            ->post("/sessions/{$this->session->id}/attendance", [
                'attendance' => [
                    [
                        'student_id' => $this->student->id,
                        'absent' => false,
                    ],
                ],
            ]);

        $response->assertSessionHas('success');

        $this->assertSame(0, Absence::count());
        $this->assertDatabaseMissing('absences', [
            'student_id' => $this->student->id,
            'session_id' => $this->session->id,
        ]);
    }
}

