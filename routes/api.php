<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\InstallController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Install endpoints (no auth required)
Route::prefix('install/{token}')->group(function () {
    Route::get('/pubkey', [InstallController::class, 'publicKey']);
    Route::post('/complete', [InstallController::class, 'complete']);
});

// Agent endpoints (token auth)
Route::prefix('agent')->group(function () {
    Route::post('/heartbeat', [AgentController::class, 'heartbeat']);
});
