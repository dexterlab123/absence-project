<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RosterImportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected AcademicYear $academicYear;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'surveillant']);
        Role::firstOrCreate(['name' => 'formateur']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->academicYear = AcademicYear::create([
            'name' => '2026-2027',
            'is_current' => true,
        ]);
    }

    protected function createXmlRoster(): UploadedFile
    {
        $xmlContent = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<students>
    <student>
        <matriculeetudiant>M1001</matriculeetudiant>
        <nom>BENALI</nom>
        <prenom>Karim</prenom>
        <nom_arabe>بن علي</nom_arabe>
        <prenom_arabe>كريم</prenom_arabe>
        <libellelong>DEV101</libellelong>
        <datenaissance>15/05/2002 00:00:00</datenaissance>
        <lieunaissance>Nador</lieunaissance>
        <cin>S123456</cin>
        <ntelelephone>0611223344</ntelelephone>
    </student>
    <student>
        <matriculeetudiant>M1002</matriculeetudiant>
        <nom>ALAOUI</nom>
        <prenom>Sara</prenom>
        <nom_arabe>العلوي</nom_arabe>
        <prenom_arabe>سارة</prenom_arabe>
        <libellelong>DEV101</libellelong>
        <datenaissance>20/08/2003 00:00:00</datenaissance>
        <lieunaissance>Nador</lieunaissance>
        <cin>S654321</cin>
        <ntelelephone>0699887766</ntelelephone>
    </student>
</students>
XML;

        return UploadedFile::fake()->createWithContent('roster.xml', $xmlContent);
    }

    public function test_admin_can_import_full_roster(): void
    {
        $file = $this->createXmlRoster();

        $response = $this->actingAs($this->admin)->post('/students/import', [
            'file' => $file,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('importSummary');

        $this->assertDatabaseHas('groups', [
            'name' => 'DEV101',
            'academic_year_id' => $this->academicYear->id,
        ]);

        $this->assertDatabaseHas('students', [
            'student_number' => 'M1001',
            'full_name' => 'BENALI Karim',
        ]);

        $this->assertDatabaseHas('students', [
            'student_number' => 'M1002',
            'full_name' => 'ALAOUI Sara',
        ]);

        $this->assertSame(2, Student::count());
        $this->assertSame(2, Enrollment::count());
    }

    public function test_reimport_does_not_create_duplicates(): void
    {
        $file1 = $this->createXmlRoster();
        $this->actingAs($this->admin)->post('/students/import', [
            'file' => $file1,
        ]);

        $this->assertSame(2, Student::count());
        $this->assertSame(1, Group::count());
        $this->assertSame(2, Enrollment::count());

        // Second import of the same roster
        $file2 = $this->createXmlRoster();
        $response = $this->actingAs($this->admin)->post('/students/import', [
            'file' => $file2,
        ]);

        $response->assertSessionHasNoErrors();

        // Counts must remain identical (no duplicates)
        $this->assertSame(2, Student::count());
        $this->assertSame(1, Group::count());
        $this->assertSame(2, Enrollment::count());
    }

    public function test_import_with_invalid_extension_fails_validation(): void
    {
        $file = UploadedFile::fake()->create('roster.pdf', 100);

        $response = $this->actingAs($this->admin)->post('/students/import', [
            'file' => $file,
        ]);

        $response->assertSessionHasErrors('file');
    }
}

