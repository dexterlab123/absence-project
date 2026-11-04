<?php

use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
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
    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('/groups/{group}', [GroupController::class, 'show'])->name('groups.show');
    Route::post('/groups/{group}/students', [GroupController::class, 'addStudent'])->name('groups.addStudent');
    Route::post('/groups/{group}/import', [GroupController::class, 'import'])->name('groups.import');

    // Sessions / Absences
    Route::get('/absences', [SessionController::class, 'index'])->name('absences.index');
    Route::get('/sessions/create', [SessionController::class, 'create'])->name('sessions.create');
    Route::post('/sessions', [SessionController::class, 'store'])->name('sessions.store');
    Route::get('/sessions/{session}', [SessionController::class, 'show'])->name('sessions.show');

    // Attendance
    Route::post('/sessions/{session}/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::patch('/absences/{absence}', [AttendanceController::class, 'update'])->name('absences.update');
    Route::patch('/absences/{absence}/billet', [AbsenceController::class, 'issueBillet'])->name('absences.issueBillet');
    Route::post('/absences/billets', [AbsenceController::class, 'issueBilletBulk'])->name('absences.issueBilletBulk');

    // Exports
    Route::post('/export/student-details', [ExportController::class, 'studentDetails'])->name('export.studentDetails');
    Route::post('/export/absence-list', [ExportController::class, 'absenceList'])->name('export.absenceList');

    // Statistics
    Route::get('/statistics', [\App\Http\Controllers\StatisticsController::class, 'index'])->name('statistics.index');
    Route::get('/statistics/top-absences', [\App\Http\Controllers\StatisticsController::class, 'topAbsences'])->name('statistics.topAbsences');

    // Students
    Route::post('/students/import', [StudentController::class, 'importAll'])->name('students.importAll');
    Route::get('/students/{student}', [StudentController::class, 'show'])->name('students.show');

    // Admin
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/accounts', [\App\Http\Controllers\Admin\AdminController::class, 'accounts'])->name('accounts');
        
        Route::post('/formateurs', [\App\Http\Controllers\Admin\FormateurController::class, 'store'])->name('formateurs.store');
        Route::put('/formateurs/{formateur}/groups', [\App\Http\Controllers\Admin\FormateurController::class, 'updateGroups'])->name('formateurs.updateGroups');
        Route::delete('/formateurs/{formateur}', [\App\Http\Controllers\Admin\FormateurController::class, 'destroy'])->name('formateurs.destroy');
        
        Route::post('/surveillants', [\App\Http\Controllers\Admin\SurveillantController::class, 'store'])->name('surveillants.store');
        Route::delete('/surveillants/{surveillant}', [\App\Http\Controllers\Admin\SurveillantController::class, 'destroy'])->name('surveillants.destroy');
    });
});

require __DIR__.'/auth.php';
