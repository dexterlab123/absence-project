<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile (from Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Groups
    Route::get('/groups', [GroupController::class, 'index'])->name('groups.index');
    Route::get('/groups/{group}', [GroupController::class, 'show'])->name('groups.show');
    Route::post('/groups/{group}/students', [GroupController::class, 'addStudent'])->name('groups.addStudent');
    Route::post('/groups/{group}/import', [GroupController::class, 'import'])->name('groups.import');

    // Sessions
    Route::get('/groups/{group}/sessions/create', [SessionController::class, 'create'])->name('sessions.create');
    Route::post('/sessions', [SessionController::class, 'store'])->name('sessions.store');
    Route::get('/sessions/{session}', [SessionController::class, 'show'])->name('sessions.show');

    // Attendance
    Route::post('/sessions/{session}/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::patch('/absences/{absence}', [AttendanceController::class, 'update'])->name('absences.update');

    // Students
    Route::get('/students/{student}', [StudentController::class, 'show'])->name('students.show');
});

require __DIR__.'/auth.php';
