<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ExamenController;
use App\Http\Controllers\Api\UserController;

// 1. الـ Login كيبقى برا
Route::post('/login', [AuthController::class, 'login']);

Route::post('/patient/auth', [ExamenController::class, 'patientLogin']);



// 2. كاع الـ Routes المحميين بـ Sanctum
Route::middleware('auth:sanctum')->group(function () {
    
    // --- المستخدمين (Admin) ---
    // كيعوض (index, store, show, update, destroy)
    Route::apiResource('users', UserController::class);

    // --- المرضى (Patients) ---
    // كيعوض (index, store, show, update, destroy)
    Route::apiResource('patients', PatientController::class);

    // --- التحاليل (Examens) ---
    Route::get('/examens', [ExamenController::class, 'index']);
    Route::post('/examens', [ExamenController::class, 'store']);
    Route::patch('/examens/{id}/resultat', [ExamenController::class, 'updateResult']);

    // --- Logout & Session ---
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/me', function (Request $request) {
        return $request->user();
    });
});
