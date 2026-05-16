<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ExamenController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BiologisteController;
use App\Http\Controllers\Api\MedecinController;
use App\Http\Controllers\Api\AnalyseController;
use App\Http\Controllers\Api\PatientAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\Api\RendezVousController;

// ============================================================
// --- 1. PUBLIC ROUTES (No Auth Required) ---
// ============================================================
Route::get('/login', function () {
    return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
})->name('login');

    Route::get('/examens/{id}/pdf',           [ExamenController::class, 'generatePDF']);



Route::post('/rendezvous/send-code', [RendezVousController::class, 'sendVerificationCode']);
Route::post('/rendezvous/store',     [RendezVousController::class, 'store']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/patient/auth', [ExamenController::class, 'patientLogin']);
Route::post('/patient/check-access', [PatientAuthController::class, 'checkAccess']);

// Examens - Read public
Route::get('/examens-today',      [ExamenController::class, 'getTodayExamens']);
Route::get('/examens-biologiste', [ExamenController::class, 'getBiologisteExamens']);
Route::get('/examens-validation', [ExamenController::class, 'getPendingValidation']);
Route::get('/examens-historique', [ExamenController::class, 'getHistorique']);
Route::get('/stats/monthly-analyses', [ExamenController::class, 'getMonthlyStats']);

// Patient results - public
Route::get('/patient/results/{id}',  [PatientAuthController::class, 'getResults']);
Route::get('/examens/results/{id}',  [PatientAuthController::class, 'getResults']);

// Medecins & Analyses - Read public
Route::get('/medecins',      [MedecinController::class, 'index']);
Route::get('/medecins/{id}', [MedecinController::class, 'show']);
Route::get('/analyses',      [AnalyseController::class, 'index']);
Route::get('/analyses/{id}', [AnalyseController::class, 'show']);

// Biologiste profile stats - public
Route::get('/biologiste/profile-stats/{userId}', [BiologisteController::class, 'profileStats']);

// ============================================================
// --- 2. PROTECTED ROUTES (auth:sanctum Required) ---
// ============================================================

Route::middleware('auth:sanctum')->group(function () {

    // --- Auth ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', fn(Request $r) => $r->user());

    //admin stats
    Route::get('/admin/stats', [DashboardController::class, 'getAdminStats']);

    // 1. روت باش الـ Biologiste يشوف المواعيد لّي كتسنى التحاليل
    Route::get('/biologiste/rendezvous-valides', [RendezVousController::class, 'getRendezVousValides']);

// 2. روت باش الـ Biologiste يسيفط النتيجة ويعمّر الطابلو د resultats
    Route::post('/biologiste/store-resultat', [RendezVousController::class, 'storeResultat']);

    Route::get('/rendezvous', [RendezVousController::class, 'index']);
    Route::put('/rendezvous/{id}/statut', [RendezVousController::class, 'updateStatut']);

    //stuuf
    Route::get('/admin/staff', [StaffController::class, 'index']);
    Route::post('/admin/staff', [StaffController::class, 'store']);
    Route::delete('/admin/staff/{id}', [StaffController::class, 'destroy']);

    // --- Profile ---
    Route::put('/user/update-profile',    [UserController::class, 'updateProfile']);
    Route::post('/user/change-password',  [UserController::class, 'changePassword']);
    Route::post('/profile/update-avatar', [AuthController::class, 'updateProfile']);
    Route::get('/profile/get',            [AuthController::class, 'getProfile']);
    Route::get('/user/profile',           fn(Request $r) => response()->json($r->user()));

    // --- Users ---
    Route::apiResource('users', UserController::class);

    // --- Patients ---
    // IMPORTANT: Routes spécifiques AVANT apiResource pour éviter les conflits
    Route::get('/patients/count/{id}',                    [PatientController::class, 'getUserStats']);
    Route::get('/patients/user-patient-count/{id}',       [PatientController::class, 'getUserPatientCount']);
    Route::get('/patients/biologiste-stats/{biologistId}',[PatientController::class, 'getBiologistStats']);
    Route::apiResource('patients', PatientController::class);

    // --- Examens ---
    // IMPORTANT: Routes spécifiques AVANT les routes avec {id}
    Route::get('/examens/my-results',         [ExamenController::class, 'getMyResults']);
    Route::get('/examens',                    [ExamenController::class, 'index']);
    Route::post('/examens',                   [ExamenController::class, 'store']);

    // Routes avec {id} — après les routes fixes
    Route::post('/examens/{id}/resultats',    [ExamenController::class, 'storeResults']);
    Route::patch('/examens/{id}/valider',     [ExamenController::class, 'validerExamen']);
    Route::patch('/examens/{id}/annuler',     [ExamenController::class, 'annulerExamen']);
    Route::patch('/examens/{id}/approve',     [ExamenController::class, 'finalApprove']);
    Route::patch('/examens/{id}/resultat',    [ExamenController::class, 'updateResult']);
    Route::put('/examens/{id}/reject',        [ExamenController::class, 'reject']);
    Route::put('/examens/{id}',               [ExamenController::class, 'update']);

    // --- Medecins & Analyses (Write) ---
    Route::post('/medecins',        [MedecinController::class, 'store']);
    Route::put('/medecins/{id}',    [MedecinController::class, 'update']);
    Route::delete('/medecins/{id}', [MedecinController::class, 'destroy']);
    Route::post('/analyses',        [AnalyseController::class, 'store']);
    Route::put('/analyses/{id}',    [AnalyseController::class, 'update']);
    Route::delete('/analyses/{id}', [AnalyseController::class, 'destroy']);

    // --- Biologiste ---
    Route::get('/biologiste/stats', [BiologisteController::class, 'getStats']);

});