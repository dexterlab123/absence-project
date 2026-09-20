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
        $professorRole = Role::firstOrCreate(['name' => 'professor']);

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@ista-nador.ma'],
            [
                'name' => 'Admin ISTA',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($adminRole);

        // Create sample professor user
        $professor = User::firstOrCreate(
            ['email' => 'professor@ista-nador.ma'],
            [
                'name' => 'Prof. Mohammed',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $professor->assignRole($professorRole);

        // Create current academic year
        $academicYear = AcademicYear::firstOrCreate(
            ['name' => '2026-2027'],
            ['is_current' => true]
        );

        // Create sample groups
        Group::firstOrCreate(
            ['name' => 'DEV101', 'academic_year_id' => $academicYear->id]
        );
        Group::firstOrCreate(
            ['name' => 'DEV102', 'academic_year_id' => $academicYear->id]
        );
    }
}
