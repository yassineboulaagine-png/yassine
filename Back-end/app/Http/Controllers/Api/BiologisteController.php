<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Examen;
use App\Models\LigneExamen;
use DB;

class BiologisteController extends Controller
{
    /**
     * Get authenticated biologist's profile statistics
     * Uses the current authenticated user's ID automatically
     * 
     * @return json Statistics including validated analyses and pathological alerts
     */
    public function getStats(Request $request)
    {
        return $this->calculateStats($request->user()->id);
    }

    /**
     * Get profile statistics for Biologist (Biologiste)
     * 
     * @param int $userId The ID of the biologist user
     * @return json Statistics including validated analyses and pathological alerts
     */
    public function profileStats($userId)
    {
        return $this->calculateStats($userId);
    }

    /**
     * Calculate stats for a given user ID
     * 
     * @param int $userId The biologist user ID
     * @return json Statistics response
     */
    private function calculateStats($userId)
    {
        try {
            // 1. Count examens validated by THIS BIOLOGIST with statut = 'termine'
            $totalValidated = Examen::where('biologiste_id', $userId)
                ->where('statut', 'termine')
                ->count();

            // 2. Count pathological results (valeur outside norme range)
            // Only count results from exams validated by this specific biologist
            $pathologicalCount = LigneExamen::whereHas('examen', function ($query) use ($userId) {
                $query->where('biologiste_id', $userId)
                      ->where('statut', 'termine');
            })
            ->join('analyses', 'ligne_examens.analyse_id', '=', 'analyses.id')
            ->where(function ($query) {
                $query->whereRaw('CAST(ligne_examens.valeur_resultat AS DECIMAL(10,2)) < analyses.norme_min')
                      ->orWhereRaw('CAST(ligne_examens.valeur_resultat AS DECIMAL(10,2)) > analyses.norme_max');
            })
            ->whereNotNull('ligne_examens.valeur_resultat')
            ->distinct('ligne_examens.id')
            ->count();

            return response()->json([
                'total_validated' => $totalValidated,
                'pathological_count' => $pathologicalCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des statistiques',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
