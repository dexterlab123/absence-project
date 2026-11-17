<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $surveillant;
    protected User $formateurAssigned;
    protected User $formateurUnassigned;
    protected Group $group;
    protected AcademicYear $academicYear;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'surveillant']);
        Role::firstOrCreate(['name' => 'formateur']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->surveillant = User::factory()->create();
        $this->surveillant->assignRole('surveillant');

        $this->formateurAssigned = User::factory()->create();
        $this->formateurAssigned->assignRole('formateur');

        $this->formateurUnassigned = User::factory()->create();
        $this->formateurUnassigned->assignRole('formateur');

        $this->academicYear = AcademicYear::create([
            'name' => '2026-2027',
            'is_current' => true,
        ]);

        $this->group = Group::create([
            'name' => 'DEV101',
            'academic_year_id' => $this->academicYear->id,
        ]);

        $this->formateurAssigned->groups()->attach($this->group->id);
    }

    public function test_only_admin_can_create_group(): void
    {
        // Admin succeeds
        $response = $this->actingAs($this->admin)->post('/groups', [
            'name' => 'DEV102',
        ]);
        $response->assertSessionHas('success');

        // Surveillant fails with 403
        $response = $this->actingAs($this->surveillant)->post('/groups', [
            'name' => 'DEV103',
        ]);
        $response->assertStatus(403);

        // Formateur fails with 403
        $response = $this->actingAs($this->formateurAssigned)->post('/groups', [
            'name' => 'DEV104',
        ]);
        $response->assertStatus(403);
    }

    public function test_only_admin_can_import_full_roster(): void
    {
        $file = UploadedFile::fake()->create('test.xml', 10);

        $this->actingAs($this->surveillant)->post('/students/import', ['file' => $file])
            ->assertStatus(403);

        $this->actingAs($this->formateurAssigned)->post('/students/import', ['file' => $file])
            ->assertStatus(403);
    }

    public function test_adding_student_authorization(): void
    {
        $payload = [
            'full_name' => 'Stagiaire Test 1',
            'student_number' => 'STG001',
        ];

        // Admin can add
        $this->actingAs($this->admin)
            ->post("/groups/{$this->group->id}/students", $payload)
            ->assertSessionHas('success');

        // Surveillant can add
        $this->actingAs($this->surveillant)
            ->post("/groups/{$this->group->id}/students", [
                'full_name' => 'Stagiaire Test 2',
                'student_number' => 'STG002',
            ])
            ->assertSessionHas('success');

        // Formateur assigned can add
        $this->actingAs($this->formateurAssigned)
            ->post("/groups/{$this->group->id}/students", [
                'full_name' => 'Stagiaire Test 3',
                'student_number' => 'STG003',
            ])
            ->assertSessionHas('success');

        // Formateur not assigned is forbidden
        $this->actingAs($this->formateurUnassigned)
            ->post("/groups/{$this->group->id}/students", [
                'full_name' => 'Stagiaire Test 4',
                'student_number' => 'STG004',
            ])
            ->assertStatus(403);
    }

    public function test_group_import_authorization(): void
    {
        $file = UploadedFile::fake()->create('list.xml', 10);

        // Unassigned formateur cannot import for this group
        $this->actingAs($this->formateurUnassigned)
            ->post("/groups/{$this->group->id}/import", ['file' => $file])
            ->assertStatus(403);
    }

    public function test_session_store_authorization(): void
    {
        $sessionPayload = [
            'group_id' => $this->group->id,
            'subject' => 'Maths',
            'professor_id' => $this->formateurAssigned->id,
            'date' => '2026-11-17',
            'start_time' => '08:30',
            'end_time' => '10:30',
        ];

        // Admin can store
        $this->actingAs($this->admin)
            ->post('/sessions', $sessionPayload)
            ->assertRedirect();

        // Formateur assigned can store
        $this->actingAs($this->formateurAssigned)
            ->post('/sessions', [
                ...$sessionPayload,
                'subject' => 'Algorithmics',
            ])
            ->assertRedirect();

        // Formateur unassigned is forbidden
        $this->actingAs($this->formateurUnassigned)
            ->post('/sessions', $sessionPayload)
            ->assertStatus(403);

        // Surveillant is forbidden
        $this->actingAs($this->surveillant)
            ->post('/sessions', $sessionPayload)
            ->assertStatus(403);
    }

    public function test_statistics_and_top_absences_authorization(): void
    {
        // Admin allowed
        $this->actingAs($this->admin)->get('/statistics')->assertOk();
        $this->actingAs($this->admin)->get('/statistics/top-absences')->assertOk();

        // Surveillant allowed
        $this->actingAs($this->surveillant)->get('/statistics')->assertOk();
        $this->actingAs($this->surveillant)->get('/statistics/top-absences')->assertOk();

        // Formateur forbidden
        $this->actingAs($this->formateurAssigned)->get('/statistics')->assertStatus(403);
        $this->actingAs($this->formateurAssigned)->get('/statistics/top-absences')->assertStatus(403);
    }
}

