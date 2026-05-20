<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LigneExamen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LigneExamenController extends Controller
{
    public function approuverLigneExamen(Request $request, LigneExamen $ligneExamen)
    {
        $validated = $request->validate([
            'conclusion' => 'required|string|max:1000',
        ]);

        $resultat = DB::transaction(function () use ($ligneExamen, $validated) {
            if (Schema::hasColumn($ligneExamen->getTable(), 'statut')) {
                $ligneExamen->forceFill(['statut' => 'valide'])->save();
            }

            return $ligneExamen->resultats()->create([
                'conclusion' => trim($validated['conclusion']),
                'date_validation' => now(),
            ]);
        });

        $ligneExamen->load([
            'analyse.typeAnalyse',
            'examen.patient',
            'resultats',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ligne examen approuvee et validation journalisee.',
            'data' => [
                'ligne_examen' => $this->formatLigneExamen($ligneExamen),
                'validation_log' => $this->formatResultat($resultat),
            ],
        ], 201);
    }

    public function getValidationHistory(LigneExamen $ligneExamen)
    {
        $ligneExamen->load([
            'analyse.typeAnalyse',
            'examen.patient',
            'resultats',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Historique de validation recupere.',
            'data' => [
                'ligne_examen' => $this->formatLigneExamen($ligneExamen),
            ],
        ]);
    }

    private function formatLigneExamen(LigneExamen $ligneExamen): array
    {
        return [
            'id' => $ligneExamen->id,
            'valeur_resultat' => $ligneExamen->valeur_resultat,
            'commentaire' => $ligneExamen->commentaire,
            'examen' => $ligneExamen->examen ? [
                'id' => $ligneExamen->examen->id,
                'reference' => $ligneExamen->examen->reference,
                'statut' => $ligneExamen->examen->statut,
                'date_examen' => $ligneExamen->examen->date_examen,
                'patient' => $ligneExamen->examen->patient ? [
                    'id' => $ligneExamen->examen->patient->id,
                    'nom' => $ligneExamen->examen->patient->nom,
                    'prenom' => $ligneExamen->examen->patient->prenom,
                    'telephone' => $ligneExamen->examen->patient->telephone,
                ] : null,
            ] : null,
            'analyse' => $ligneExamen->analyse ? [
                'id' => $ligneExamen->analyse->id,
                'designation' => $ligneExamen->analyse->designation,
                'unite_mesure' => $ligneExamen->analyse->unite_mesure,
                'norme_min' => $ligneExamen->analyse->norme_min,
                'norme_max' => $ligneExamen->analyse->norme_max,
                'type_analyse' => $ligneExamen->analyse->typeAnalyse,
            ] : null,
            'history' => $ligneExamen->resultats
                ->map(fn ($resultat) => $this->formatResultat($resultat))
                ->values(),
        ];
    }

    private function formatResultat($resultat): array
    {
        return [
            'id' => $resultat->id,
            'conclusion' => $resultat->conclusion,
            'date_validation' => optional($resultat->date_validation)->toISOString(),
            'created_at' => optional($resultat->created_at)->toISOString(),
        ];
    }
}
