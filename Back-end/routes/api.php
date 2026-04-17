<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ExamenController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- 1. Routes li bla Auth (Public) ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/patient/auth', [ExamenController::class, 'patientLogin']);

// --- 2. Routes dial Profile & Settings (Zidnahom l-foq bach n-tfadaw 405/404) ---
// Had l-URL khass i-koun hwa: http://localhost:8000/api/user/update-profile
Route::put('/user/update-profile', [UserController::class, 'updateProfile']);

// Had l-URL khass i-koun hwa: http://localhost:8000/api/user/change-password
Route::post('/user/change-password', [UserController::class, 'changePassword']);


// --- 3. Routes dial Patients ---
Route::apiResource('patients', PatientController::class);
Route::get('/patients/count/{id}', [PatientController::class, 'getUserStats']);


// --- 4. Routes محميين بـ Sanctum ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Had l-route Resource katsme7 b GET /api/users, POST /api/users, etc.
    Route::apiResource('users', UserController::class);

    Route::get('/examens', [ExamenController::class, 'index']);
    Route::post('/examens', [ExamenController::class, 'store']);
    Route::patch('/examens/{id}/resultat', [ExamenController::class, 'updateResult']);

    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/me', function (Request $request) {
        return $request->user();
    });
});