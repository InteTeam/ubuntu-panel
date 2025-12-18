<?php

declare(strict_types=1);

use App\Http\Controllers\AppController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\SetupController;
use App\Http\Controllers\Auth\TwoFactorChallengeController;
use App\Http\Controllers\Auth\TwoFactorSetupController;
use App\Http\Controllers\InstallController;
use App\Http\Controllers\ServerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Install script (public, returns bash)
Route::get('/install/{token}', [InstallController::class, 'script']);

// Setup wizard (first-time setup)
Route::middleware('guest')->group(function () {
    Route::get('/setup', [SetupController::class, 'show'])->name('setup');
    Route::post('/setup', [SetupController::class, 'store']);
    
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    // Password reset
    Route::get('/forgot-password', [ForgotPasswordController::class, 'show'])->name('password.request');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'store'])->name('password.email');
    Route::get('/reset-password/{token}', [ResetPasswordController::class, 'show'])->name('password.reset');
    Route::post('/reset-password', [ResetPasswordController::class, 'store'])->name('password.update');

    // 2FA challenge (session-based, not fully authenticated)
    Route::get('/two-factor/challenge', [TwoFactorChallengeController::class, 'show'])->name('two-factor.challenge');
    Route::post('/two-factor/challenge', [TwoFactorChallengeController::class, 'store']);
});

// Logout (requires auth)
Route::post('/logout', [LoginController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// 2FA setup (auth required, but before 2FA enforcement)
Route::middleware('auth')->prefix('two-factor')->name('two-factor.')->group(function () {
    Route::get('/setup', [TwoFactorSetupController::class, 'show'])->name('setup');
    Route::post('/confirm', [TwoFactorSetupController::class, 'confirm'])->name('confirm');
});

// Protected routes (require auth + 2FA)
Route::middleware(['auth', 'two-factor'])->group(function () {
    Route::get('/', function () {
        return redirect()->route('dashboard');
    });

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Servers
    Route::resource('servers', ServerController::class);
    Route::post('/servers/{server}/test-connection', [ServerController::class, 'testConnection'])->name('servers.test-connection');
    Route::post('/servers/{server}/rotate-token', [ServerController::class, 'rotateToken'])->name('servers.rotate-token');

    // Apps
    Route::resource('apps', AppController::class);
    Route::post('/apps/{app}/deploy/{environment?}', [AppController::class, 'deploy'])->name('apps.deploy');
    Route::post('/apps/{app}/rollback/{deployment}', [AppController::class, 'rollback'])->name('apps.rollback');

    // Backups
    Route::get('/backups', [BackupController::class, 'index'])->name('backups.index');
    Route::post('/backups', [BackupController::class, 'createBackup'])->name('backups.create');
    Route::delete('/backups/{backup}', [BackupController::class, 'destroyBackup'])->name('backups.destroy');

    // Backup Destinations
    Route::post('/backups/destinations', [BackupController::class, 'storeDestination'])->name('backups.destinations.store');
    Route::put('/backups/destinations/{destination}', [BackupController::class, 'updateDestination'])->name('backups.destinations.update');
    Route::delete('/backups/destinations/{destination}', [BackupController::class, 'destroyDestination'])->name('backups.destinations.destroy');

    // Backup Schedules
    Route::post('/backups/schedules', [BackupController::class, 'storeSchedule'])->name('backups.schedules.store');
    Route::put('/backups/schedules/{schedule}', [BackupController::class, 'updateSchedule'])->name('backups.schedules.update');
    Route::delete('/backups/schedules/{schedule}', [BackupController::class, 'destroySchedule'])->name('backups.schedules.destroy');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications', [NotificationController::class, 'destroyAll'])->name('notifications.destroy-all');

    // Security
    Route::get('/security', [SecurityController::class, 'index'])->name('security.index');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
});
