<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesAndUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $formateurRole = Role::firstOrCreate(['name' => 'formateur']);
        $surveillantRole = Role::firstOrCreate(['name' => 'surveillant']);

        // Create admin user (uses email for login)
        $admin = User::firstOrCreate(
            ['email' => 'admin@ista-nador.ma'],
            [
                'name' => 'Admin ISTA',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($adminRole);

        // Create sample formateur user (uses matricule for login)
        $formateur = User::firstOrCreate(
            ['matricule' => 'F001'],
            [
                'name' => 'Mohammed Formateur',
                'email' => 'formateur@ista-nador.ma',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $formateur->assignRole($formateurRole);

        // Create sample surveillant user (uses matricule for login)
        $surveillant = User::firstOrCreate(
            ['matricule' => 'S001'],
            [
                'name' => 'Ahmed Surveillant',
                'email' => 'surveillant@ista-nador.ma',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $surveillant->assignRole($surveillantRole);

        // Create current academic year
        $academicYear = AcademicYear::firstOrCreate(
            ['name' => '2026-2027'],
            ['is_current' => true]
        );

        // Create sample groups
        $group1 = Group::firstOrCreate(
            ['name' => 'DEV101', 'academic_year_id' => $academicYear->id]
        );
        $group2 = Group::firstOrCreate(
            ['name' => 'DEV102', 'academic_year_id' => $academicYear->id]
        );

        // Assign sample formateur to a group so they aren't locked out
        $formateur->groups()->syncWithoutDetaching([$group1->id]);
    }
}
