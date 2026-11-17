<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_matricule(): void
    {
        Role::create(['name' => 'admin']);
        $user = User::factory()->create([
            'matricule' => 'ADM001',
        ]);
        $user->assignRole('admin');

        $response = $this->post('/login', [
            'login' => 'ADM001',
            'password' => 'password',
            'role' => 'admin',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_authenticate_using_name(): void
    {
        Role::create(['name' => 'surveillant']);
        $user = User::factory()->create([
            'name' => 'Ahmed Surveillant',
        ]);
        $user->assignRole('surveillant');

        $response = $this->post('/login', [
            'login' => 'Ahmed Surveillant',
            'password' => 'password',
            'role' => 'surveillant',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        Role::create(['name' => 'admin']);
        $user = User::factory()->create([
            'matricule' => 'ADM001',
        ]);
        $user->assignRole('admin');

        $this->post('/login', [
            'login' => 'ADM001',
            'password' => 'wrong-password',
            'role' => 'admin',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_not_authenticate_with_wrong_role(): void
    {
        Role::create(['name' => 'formateur']);
        $user = User::factory()->create([
            'matricule' => 'F001',
        ]);
        $user->assignRole('formateur');

        $this->post('/login', [
            'login' => 'F001',
            'password' => 'password',
            'role' => 'admin',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
