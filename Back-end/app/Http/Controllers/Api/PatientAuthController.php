<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Examen;
use Illuminate\Support\Facades\Validator;

class PatientAuthController extends Controller
{
    /**
     * Vérifier l'accès du patient à ses résultats
     * Respecte les principes : MVC, ORM et Validation des données
     */
    public function checkAccess(Request $request)
    {
        // 1. Validation des champs d'entrée
        $validator = Validator::make($request->all(), [
            'telephone' => 'required|string',
            'reference' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Recherche de l'examen via Eloquent ORM
        // On vérifie la référence de l'examen et le téléphone du patient associé
        $examen = Examen::where('reference', $request->reference)
            ->whereHas('patient', function($query) use ($request) {
                $query->where('telephone', $request->telephone);
            })
            ->with(['patient', 'type_analyse']) // Chargement des relations[cite: 1]
            ->first();

        // 3. Gestion d'erreur si l'examen n'est pas trouvé
        if (!$examen) {
            return response()->json([
                'success' => false,
                'message' => 'Informations invalides. Veuillez vérifier le téléphone et la référence.'
            ], 404);
        }

        // 4. Réponse JSON pour le frontend React[cite: 1]
        $token = $examen->patient->createToken('patient-token')->plainTextToken;
        return response()->json([
            'success' => true,
            'token'   => $token,
            'data' => [
                'exam_id' => $examen->id,
                'statut' => $examen->statut, // en_cours, termine, rejete[cite: 1]
                'patient_name' => $examen->patient->nom . ' ' . $examen->patient->prenom,
                'type_analyse' => $examen->type_analyse->libelle ?? 'Analyse Médicale',
                'created_at' => $examen->created_at->format('d/m/Y'),
            ],
            'examen' => $examen,
            'message' => 'Accès autorisé avec succès.'
        ]);
    }

    /**
     * Récupérer les détails des résultats (Ligne Examens)[cite: 1]
     */
    public function getResults($id)
    {
        // Récupération de l'examen avec ses lignes de résultats réelles[cite: 1]
        $examen = Examen::with(['ligneExamens.analyse', 'patient', 'type_analyse'])
                        ->findOrFail($id);

        return response()->json([
            'success' => true,
            'examen' => $examen
        ]);
    }
}