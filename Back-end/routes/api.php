<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ExamenController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BiologisteController;

use App\Http\Controllers\Api\PatientAuthController;
// --- 1. Public Routes ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/patient/auth', [ExamenController::class, 'patientLogin']);

// --- 2. User & Profile ---
Route::put('/user/update-profile', [UserController::class, 'updateProfile']);
Route::post('/user/change-password', [UserController::class, 'changePassword']);

// --- 3. Patients ---
Route::middleware('auth:sanctum')->group(function (){
    Route::get('/patients/count/{id}', [PatientController::class, 'getUserStats']);
    Route::get('/patients/user-patient-count/{id}', [PatientController::class, 'getUserPatientCount']);
    Route::get('/patients/biologiste-stats/{biologistId}', [PatientController::class, 'getBiologistStats']);
    Route::apiResource('patients', PatientController::class);
});
// --- 4. Examens (Logic dial Dashboard) ---
// Public read routes
Route::get('/examens-today', [ExamenController::class, 'getTodayExamens']);
Route::get('/examens-biologiste', [ExamenController::class, 'getBiologisteExamens']);
Route::get('/examens-validation', [ExamenController::class, 'getPendingValidation']);
Route::get('/examens-historique', [ExamenController::class, 'getHistorique']);

// Protected write routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/examens/my-results', [ExamenController::class, 'getMyResults']);
    Route::patch('/examens/{id}/valider', [ExamenController::class, 'validerExamen']);
    Route::patch('/examens/{id}/annuler', [ExamenController::class, 'annulerExamen']);
    Route::post('/examens/{id}/resultats', [ExamenController::class, 'storeResults']);
    Route::patch('/examens/{id}/approve', [ExamenController::class, 'finalApprove']);
    Route::put('/examens/{id}/reject', [ExamenController::class, 'reject']);
});

// --- 5. Biologiste ---
Route::get('/biologiste/profile-stats/{userId}', [BiologisteController::class, 'profileStats']);

// Authenticated route for current user's stats
Route::middleware('auth:sanctum')->get('/biologiste/stats', [BiologisteController::class, 'getStats']);

Route::middleware('auth:sanctum')->get('/user/profile', function (Request $request) {
    return response()->json($request->user());
});

Route::post('/patient/check-access', [PatientAuthController::class, 'checkAccess']);
Route::get('/patient/results/{id}', [PatientAuthController::class, 'getResults']);

// --- 6. Sanctum Protected ---
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::get('/examens', [ExamenController::class, 'index']);
    Route::post('/examens', [ExamenController::class, 'store']);
    Route::patch('/examens/{id}/resultat', [ExamenController::class, 'updateResult']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile endpoints
    Route::post('/profile/update-avatar', [AuthController::class, 'updateProfile']);
    Route::get('/profile/get', [AuthController::class, 'getProfile']);
    
    Route::get('/me', function (Request $request) {
        return $request->user();
    });
    
});