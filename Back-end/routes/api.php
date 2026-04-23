<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ExamenController;
use App\Http\Controllers\Api\UserController;

// --- 1. Public Routes ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/patient/auth', [ExamenController::class, 'patientLogin']);

// --- 2. User & Profile ---
Route::put('/user/update-profile', [UserController::class, 'updateProfile']);
Route::post('/user/change-password', [UserController::class, 'changePassword']);

// --- 3. Patients ---
Route::apiResource('patients', PatientController::class);
Route::get('/patients/count/{id}', [PatientController::class, 'getUserStats']);

// --- 4. Examens (Logic dial Dashboard) ---
// Had l-routes khasshom ikouno hna bach React i-l9ahom
Route::get('/examens-today', [ExamenController::class, 'getTodayExamens']); // <--- HADOU NAQSIN
Route::get('/examens-biologiste', [ExamenController::class, 'getBiologisteExamens']); // <--- HADOU NAQSIN
Route::patch('/examens/{id}/valider', [ExamenController::class, 'validerExamen']); // <--- HADOU NAQSIN
Route::patch('/examens/{id}/annuler', [ExamenController::class, 'annulerExamen']); // <--- HADOU NAQSIN

// --- 5. Sanctum Protected ---
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::get('/examens', [ExamenController::class, 'index']);
    Route::post('/examens', [ExamenController::class, 'store']);
    Route::patch('/examens/{id}/resultat', [ExamenController::class, 'updateResult']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/me', function (Request $request) {
        return $request->user();
    });
});