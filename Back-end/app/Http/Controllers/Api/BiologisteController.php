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
     * Get profile statistics for Biologist (Biologiste)
     * 
     * @param int $userId The ID of the biologist user
     * @return json Statistics including validated analyses and pathological alerts
     */
    public function profileStats($userId)
    {
        try {
            // 1. Count examens with statut = 'termine' (validated by biologiste)
            $totalValidated = Examen::where('utilisateur_id', $userId)
                ->where('statut', 'termine')
                ->count();

            // 2. Count pathological results (valeur outside norme range)
            // Join ligne_examens with analyses to get norme_min and norme_max
            // Then check if valeur_resultat < norme_min OR valeur_resultat > norme_max
            $pathologicalCount = LigneExamen::whereHas('examen', function ($query) use ($userId) {
                $query->where('utilisateur_id', $userId)
                      ->where('statut', 'termine');
            })
            ->join('analyses', 'ligne_examens.analyse_id', '=', 'analyses.id')
            ->where(function ($query) {
                $query->whereRaw('ligne_examens.valeur_resultat < analyses.norme_min')
                      ->orWhereRaw('ligne_examens.valeur_resultat > analyses.norme_max');
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
