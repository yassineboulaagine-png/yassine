<?php

/**
 * PATIENTS API REFERENCE FOR BACKEND
 * 
 * This file documents the expected API endpoints and responses
 * for the Patients Management frontend component.
 * 
 * Place your actual routes in routes/api.php
 */

// Example Laravel API Routes (routes/api.php)

/*
Route::middleware('auth:sanctum')->group(function () {
    // Get all patients
    Route::get('/patients', [PatientController::class, 'index']);
    
    // Create new patient
    Route::post('/patients', [PatientController::class, 'store']);
    
    // Update patient
    Route::put('/patients/{id}', [PatientController::class, 'update']);
    
    // Delete patient
    Route::delete('/patients/{id}', [PatientController::class, 'destroy']);
});
*/

/**
 * ============================================
 * ENDPOINT: GET /api/patients
 * ============================================
 * 
 * Retrieves all patients
 * 
 * Query Parameters:
 *  - search: (optional) Search term for filtering
 *  - page: (optional) Page number for pagination
 *  - per_page: (optional) Items per page
 * 
 * Response (200 OK):
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "nom": "Dupont",
 *             "prenom": "Jean",
 *             "cin": "12345678",
 *             "telephone": "+212612345678",
 *             "sexe": "M",
 *             "date_naissance": "1990-05-15",
 *             "created_at": "2024-01-15T10:30:00Z",
 *             "updated_at": "2024-01-15T10:30:00Z"
 *         },
 *         ...
 *     ]
 * }
 * 
 * Error Response (401 Unauthorized):
 * {
 *     "message": "Unauthenticated"
 * }
 */

/**
 * ============================================
 * ENDPOINT: POST /api/patients
 * ============================================
 * 
 * Creates a new patient
 * 
 * Request Body (JSON):
 * {
 *     "nom": "Dupont",           // Required, string, max 255
 *     "prenom": "Jean",          // Required, string, max 255
 *     "cin": "12345678",         // Required, string, unique, max 20
 *     "telephone": "+212612345678", // Required, string
 *     "sexe": "M",               // Required, enum: M|F
 *     "date_naissance": "1990-05-15" // Required, date format: YYYY-MM-DD
 * }
 * 
 * Response (201 Created):
 * {
 *     "id": 1,
 *     "nom": "Dupont",
 *     "prenom": "Jean",
 *     "cin": "12345678",
 *     "telephone": "+212612345678",
 *     "sexe": "M",
 *     "date_naissance": "1990-05-15",
 *     "created_at": "2024-01-15T10:30:00Z",
 *     "updated_at": "2024-01-15T10:30:00Z"
 * }
 * 
 * Error Response (422 Unprocessable Entity):
 * {
 *     "message": "The given data was invalid.",
 *     "errors": {
 *         "cin": ["The cin has already been taken."],
 *         "telephone": ["The telephone field is required."]
 *     }
 * }
 */

/**
 * ============================================
 * ENDPOINT: PUT /api/patients/{id}
 * ============================================
 * 
 * Updates an existing patient
 * 
 * URL Parameters:
 *  - id: Patient ID (integer)
 * 
 * Request Body (JSON) - All fields optional:
 * {
 *     "nom": "Dupont Updated",
 *     "prenom": "Jean",
 *     "cin": "12345678",
 *     "telephone": "+212612345678",
 *     "sexe": "M",
 *     "date_naissance": "1990-05-15"
 * }
 * 
 * Response (200 OK):
 * {
 *     "id": 1,
 *     "nom": "Dupont Updated",
 *     "prenom": "Jean",
 *     "cin": "12345678",
 *     "telephone": "+212612345678",
 *     "sexe": "M",
 *     "date_naissance": "1990-05-15",
 *     "created_at": "2024-01-15T10:30:00Z",
 *     "updated_at": "2024-01-15T11:45:00Z"
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *     "message": "Patient not found"
 * }
 */

/**
 * ============================================
 * ENDPOINT: DELETE /api/patients/{id}
 * ============================================
 * 
 * Deletes a patient
 * 
 * URL Parameters:
 *  - id: Patient ID (integer)
 * 
 * Response (204 No Content):
 * (Empty response body)
 * 
 * Alternative Response (200 OK):
 * {
 *     "message": "Patient deleted successfully"
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *     "message": "Patient not found"
 * }
 */

/**
 * ============================================
 * PATIENT MODEL STRUCTURE
 * ============================================
 * 
 * Expected database columns:
 * 
 * Schema::create('patients', function (Blueprint $table) {
 *     $table->id();
 *     $table->string('nom');
 *     $table->string('prenom');
 *     $table->string('cin')->unique();
 *     $table->string('telephone');
 *     $table->enum('sexe', ['M', 'F'])->default('M');
 *     $table->date('date_naissance');
 *     $table->timestamps();
 * });
 */

/**
 * ============================================
 * LARAVEL CONTROLLER EXAMPLE
 * ============================================
 */

/*
namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    // GET /api/patients
    public function index()
    {
        return response()->json([
            'data' => Patient::all()
        ]);
    }

    // POST /api/patients
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'cin' => 'required|string|unique:patients|max:20',
            'telephone' => 'required|string',
            'sexe' => 'required|in:M,F',
            'date_naissance' => 'required|date',
        ]);

        $patient = Patient::create($validated);

        return response()->json($patient, 201);
    }

    // PUT /api/patients/{id}
    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'nom' => 'string|max:255',
            'prenom' => 'string|max:255',
            'cin' => 'string|unique:patients,cin,' . $patient->id . '|max:20',
            'telephone' => 'string',
            'sexe' => 'in:M,F',
            'date_naissance' => 'date',
        ]);

        $patient->update($validated);

        return response()->json($patient);
    }

    // DELETE /api/patients/{id}
    public function destroy(Patient $patient)
    {
        $patient->delete();

        return response()->json([
            'message' => 'Patient deleted successfully'
        ]);
    }
}
*/

/**
 * ============================================
 * CORS CONFIGURATION (config/cors.php)
 * ============================================
 * 
 * Ensure CORS is properly configured to allow
 * requests from your frontend:
 * 
 * 'allowed_origins' => ['http://localhost:5173'],
 * 'allowed_methods' => ['*'],
 * 'allowed_headers' => ['*'],
 * 'exposed_headers' => ['Content-Disposition'],
 */
?>
