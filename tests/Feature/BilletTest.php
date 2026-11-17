<?php

namespace Tests\Feature;

use App\Models\Absence;
use App\Models\AcademicYear;
use App\Models\Billet;
use App\Models\Group;
use App\Models\Session;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BilletTest extends TestCase
{
    use RefreshDatabase;

    protected User $surveillant;
    protected User $admin;
    protected User $formateur;
    protected Session $session;
    protected Student $student1;
    protected Student $student2;
    protected Absence $absence1;
    protected Absence $absence2;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'surveillant']);
        Role::firstOrCreate(['name' => 'formateur']);

        $this->surveillant = User::factory()->create();
        $this->surveillant->assignRole('surveillant');

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->formateur = User::factory()->create();
        $this->formateur->assignRole('formateur');

        $academicYear = AcademicYear::create([
            'name' => '2026-2027',
            'is_current' => true,
        ]);

        $group = Group::create([
            'name' => 'DEV101',
            'academic_year_id' => $academicYear->id,
        ]);

        $this->session = Session::create([
            'group_id' => $group->id,
            'professor_id' => $this->formateur->id,
            'subject' => 'Web Development',
            'date' => '2026-11-17',
            'start_time' => '08:30',
            'end_time' => '11:00',
        ]);

        $this->student1 = Student::create([
            'full_name' => 'Mohamed Karim',
            'student_number' => 'ST001',
        ]);

        $this->student2 = Student::create([
            'full_name' => 'Yassine Tazi',
            'student_number' => 'ST002',
        ]);

        $this->absence1 = Absence::create([
            'student_id' => $this->student1->id,
            'session_id' => $this->session->id,
            'marked_by' => $this->formateur->id,
            'marked_at' => now(),
            'category' => 'Absence',
        ]);

        $this->absence2 = Absence::create([
            'student_id' => $this->student2->id,
            'session_id' => $this->session->id,
            'marked_by' => $this->formateur->id,
            'marked_at' => now(),
            'category' => 'Absence',
        ]);
    }

    public function test_surveillant_can_issue_individual_billet(): void
    {
        $response = $this->actingAs($this->surveillant)
            ->patch("/absences/{$this->absence1->id}/billet", [
                'justification_note' => 'Certificat médical présenté',
            ]);

        $response->assertSessionHas('success');

        $this->absence1->refresh();
        $this->assertNotNull($this->absence1->billet_id);

        $billet = Billet::find($this->absence1->billet_id);
        $this->assertSame('Certificat médical présenté', $billet->motif);
        $this->assertSame($this->surveillant->id, $billet->issued_by);
    }

    public function test_admin_can_issue_individual_billet(): void
    {
        $response = $this->actingAs($this->admin)
            ->patch("/absences/{$this->absence1->id}/billet", [
                'justification_note' => 'Autorisation administrative',
            ]);

        $response->assertSessionHas('success');

        $this->absence1->refresh();
        $this->assertNotNull($this->absence1->billet_id);
    }

    public function test_formateur_cannot_issue_individual_billet(): void
    {
        $response = $this->actingAs($this->formateur)
            ->patch("/absences/{$this->absence1->id}/billet", [
                'justification_note' => 'Tentative non autorisée',
            ]);

        $response->assertStatus(403);
        $this->assertNull($this->absence1->fresh()->billet_id);
    }

    public function test_surveillant_can_issue_bulk_billets(): void
    {
        $response = $this->actingAs($this->surveillant)
            ->post('/absences/billets', [
                'student_ids' => [$this->student1->id, $this->student2->id],
                'category' => 'Absence',
                'date' => '2026-11-17',
                'motif' => 'Convocation stage',
            ]);

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');

        $this->absence1->refresh();
        $this->absence2->refresh();

        $this->assertNotNull($this->absence1->billet_id);
        $this->assertNotNull($this->absence2->billet_id);
        $this->assertSame($this->absence1->billet_id, $this->absence2->billet_id);
    }

    public function test_formateur_cannot_issue_bulk_billets(): void
    {
        $response = $this->actingAs($this->formateur)
            ->post('/absences/billets', [
                'student_ids' => [$this->student1->id],
                'category' => 'Absence',
                'date' => '2026-11-17',
                'motif' => 'Non autorisé',
            ]);

        $response->assertStatus(403);
    }
}

