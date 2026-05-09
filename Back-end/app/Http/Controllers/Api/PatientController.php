<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Examen;
use App\Models\Analyse;
use App\Models\LigneExamen;
use Illuminate\Support\Facades\DB;


class PatientController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        return Patient::when($search, function($query) use ($search) {
            return $query->where('cin', 'LIKE', "%{$search}%")
                         ->orWhere('nom', 'LIKE', "%{$search}%")
                         ->orWhere('prenom', 'LIKE', "%{$search}%");
        })
        ->latest()
        ->get();
    }

    public function store(Request $request)
    {
        // Validate basic patient info
        $request->validate([
            'nom'            => 'required|string',
            'prenom'         => 'required|string',
            'cin'            => 'required|string|unique:patients,cin',
            'telephone'      => 'required|string|size:10',
            'sexe'           => 'required|in:M,F',
            'date_naissance' => 'required|date',
        ]);

        // Create patient
        $patient = Patient::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'cin' => $request->cin,
            'telephone' => $request->telephone,
            'sexe' => $request->sexe,
            'date_naissance' => $request->date_naissance,
            'user_id' => null  // Can be updated later
        ]);
        
        return response()->json($patient, 201);
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $request->validate([
            'nom'            => 'required|string',
            'prenom'         => 'required|string',
            'cin'            => 'required|string|unique:patients,cin,' . $id,
            'telephone'      => 'required|string|size:10',
            'sexe'           => 'required|in:M,F',
            'date_naissance' => 'required|date',
        ]);

        $patient->update($request->only([
            'nom', 'prenom', 'cin', 'telephone', 'sexe', 'date_naissance'
        ]));

        return response()->json($patient);
    }

    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();
        return response()->json(['message' => 'Patient supprimé']);
    }

    public function getUserStats($id)
    {
        $count = Examen::where('utilisateur_id', $id)->count();
        return response()->json(['count' => $count]);
    }

    /**
     * Get patient count for a specific user (Préleveur)
     */
    public function getUserPatientCount($id)
    {
        $count = Patient::where('user_id', $id)->count();
        return response()->json(['patient_count' => $count]);
    }

    /**
     * Get biologist statistics: validated exams and pathological alerts
     * 
     * @param int $biologistId - The ID of the biologist (utilisateur_id)
     * @return JSON response with analyses_validees and alertes_pathologiques counts
     */
    public function getBiologistStats($biologistId)
    {
        // 1. Count all exams validated by this specific biologist where statut = 'valide'
        $analysesValidees = Examen::where('biologiste_id', $biologistId)
            ->where('statut', 'valide')
            ->count();

        // 2. Count ligne_examens where valeur_resultat is outside normal range
        // Only for exams validated by this biologist
        $alertesPathologiques = LigneExamen::whereHas('examen', function($query) use ($biologistId) {
            $query->where('biologiste_id', $biologistId);
        })
        ->join('analyses', 'ligne_examens.analyse_id', '=', 'analyses.id')
        ->where(function($query) {
            $query->whereRaw('CAST(ligne_examens.valeur_resultat AS DECIMAL(10,2)) > analyses.norme_max')
                  ->orWhereRaw('CAST(ligne_examens.valeur_resultat AS DECIMAL(10,2)) < analyses.norme_min');
        })
        ->count();

        return response()->json([
            'analyses_validees' => $analysesValidees,
            'alertes_pathologiques' => $alertesPathologiques
        ]);
    }
}