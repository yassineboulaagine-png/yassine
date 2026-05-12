<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Examen;
use App\Http\Resources\ExamenResource;
use PDF;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResultatExamenMail;

class ExamenController extends Controller
{
    /**
     * Liste complète des examens avec toutes les relations
     */
    public function index()
    {
        return Examen::with(['patient', 'lignes.analyse.typeAnalyse', 'type_analyse'])
            ->latest()
            ->get();
    }

    /**
     * Examens du jour — FIX: whereDate correct + try/catch
     */
    public function getTodayExamens()
    {
        try {
           // فـ الـ function اللي كترجع الـ Examens للـ Dashboard
$examens = Examen::with(['patient', 'typeAnalyse'])->whereDate('created_at', now())->get();
               

            return response()->json($examens);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine()
            ], 500);
        }
    }

    /**
     * Examens validés pour le biologiste
     */
    public function getBiologisteExamens()
    {
        return Examen::with(['patient', 'lignes.analyse.typeAnalyse'])
            ->where('statut', 'valide')
            ->latest()
            ->get();
    }

    /**
     * Résultats de l'examen du patient authentifié
     */
    public function getMyResults()
    {
        $patient = \App\Models\Patient::where('user_id', auth()->id())->first();

        if (!$patient) {
            return response()->json(['data' => []]);
        }

        $examens = Examen::with(['patient', 'lignes.analyse.typeAnalyse'])
            ->where('patient_id', $patient->id)
            ->where('statut', 'valide')
            ->latest()
            ->get();

        return ExamenResource::collection($examens);
    }

    /**
     * Créer un nouvel examen — FIX: reference gérée par boot(), utilisateur_id sécurisé
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'patient_id'      => 'required|exists:patients,id',
                'selectedExamen' => 'required|exists:type_analyses,id',
            ]);

            $examen = Examen::create([
                'patient_id'      => $request->patient_id,
                'type_analyse_id' => $request->type_analyse_id,
                'medecin_id'      => $request->medecin_id ?? 1,
                'utilisateur_id'  => auth()->id(),
                'statut'          => 'en_cours',
                // reference et date_examen sont générés automatiquement dans boot()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Examen créé avec succès',
                'data'    => $examen->load(['patient', 'type_analyse'])
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors'  => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine()
            ], 500);
        }
    }

    /**
     * Saisir les résultats d'un examen
     */
    public function storeResults(Request $request, $id)
    {
        $examen = Examen::findOrFail($id);

        $request->validate([
            'resultats'                => 'required|array',
            'resultats.*.ligne_id'     => 'required|integer',
            'resultats.*.valeur'       => 'nullable|string',
            'resultats.*.commentaire'  => 'nullable|string',
        ]);

        try {
            foreach ($request->resultats as $resultat) {
                $ligne = $examen->lignes()->find($resultat['ligne_id']);
                if ($ligne) {
                    $valeur = $resultat['valeur'] ?? null;
                    $valeur = !empty($valeur) ? (float) $valeur : null;

                    $ligne->update([
                        'valeur_resultat' => $valeur,
                        'commentaire'     => $resultat['commentaire'] ?? null,
                    ]);
                }
            }

            $examen->update(['statut' => 'en_validation']);

            return response()->json([
                'success' => true,
                'message' => 'Résultats saisis avec succès!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Valider un examen — FIX: auth()->id() (machi auth()->$id())
     */
    public function validerExamen($id)
    {
        $examen = Examen::findOrFail($id);

        $examen->update([
            'statut'        => 'valide',
            'biologiste_id' => auth()->id() // FIX: était auth()->$id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Prélèvement validé !'
        ]);
    }

    /**
     * Annuler un examen
     */
    public function annulerExamen($id)
    {
        $examen = Examen::findOrFail($id);
        $examen->update(['statut' => 'annule']);

        return response()->json([
            'success' => true,
            'message' => 'Examen annulé.'
        ]);
    }

    /**
     * Examens en attente de validation
     */
    public function getPendingValidation()
    {
        return Examen::with(['patient', 'lignes.analyse.typeAnalyse'])
            ->where('statut', 'en_validation')
            ->latest()
            ->get();
    }

    /**
     * Historique des examens terminés
     */
    public function getHistorique()
    {
        return Examen::with(['patient', 'lignes.analyse.typeAnalyse'])
            ->where('statut', 'termine')
            ->latest()
            ->get();
    }

    /**
     * Approbation finale d'un examen
     */
    public function finalApprove($id)
    {
        $examen = Examen::findOrFail($id);

        $examen->update([
            'statut'        => 'termine',
            'biologiste_id' => auth()->id()
        ]);

        if ($examen->patient && $examen->patient->email) {
            Mail::to($examen->patient->email)->send(new ResultatExamenMail($examen));
        }

        return response()->json([
            'success' => true,
            'message' => 'Examen validé et terminé!'
        ]);
    }

    /**
     * Mettre à jour le statut d'un examen
     */
    public function updateResult(Request $request, $id)
    {
        $examen = Examen::findOrFail($id);

        $request->validate([
            'statut' => 'required|in:en_cours,valide,termine,annule,rejete,en_validation',
        ]);

        $examen->update(['statut' => $request->statut]);

        return response()->json($examen);
    }

    /**
     * Mettre à jour un examen (valeur + statut)
     */
    public function update(Request $request, $id)
    {
        $examen = Examen::findOrFail($id);

        $request->validate([
            'valeur' => 'required',
        ]);

        $examen->update([
            'valeur' => $request->valeur,
            'statut' => 'Terminée',
        ]);

        return response()->json([
            'message' => 'Résultat enregistré avec succès',
            'examen'  => $examen
        ]);
    }

    /**
     * Rejeter un examen (renvoyer à la saisie)
     */
    public function reject($id)
    {
        $examen = Examen::find($id);

        if (!$examen) {
            return response()->json(['message' => 'Examen non trouvé'], 404);
        }

        $examen->update(['statut' => 'rejete']);

        return response()->json(['message' => 'Examen renvoyé à la saisie']);
    }

    /**
     * Authentification patient par référence + téléphone
     */
    public function patientLogin(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
            'telephone' => 'required|string',
        ]);

        $examen = Examen::with(['patient', 'lignes.analyse.typeAnalyse'])
            ->where('reference', $request->reference)
            ->whereHas('patient', function ($query) use ($request) {
                $query->where('telephone', $request->telephone);
            })
            ->first();

        if (!$examen) {
            return response()->json([
                'success' => false,
                'message' => 'Référence ou numéro de téléphone incorrect.'
            ], 404);
        }

        $token = 'guest_' . hash('sha256', $examen->id . $examen->patient->telephone . time());

        return response()->json([
            'success' => true,
            'examen'  => $examen,
            'token'   => $token
        ], 200);
    }

    /**
     * Générer un PDF pour les résultats d'un examen
     */
    public function generatePDF($id)
    {
        try {
            $examen = Examen::with(['lignes.analyse', 'patient', 'type_analyse'])
                ->findOrFail($id);

            $patient = $examen->patient;
            $lignes  = $examen->lignes;

            $pdf = PDF::loadView('resultats', [
                'examen'  => $examen,
                'patient' => $patient,
                'lignes'  => $lignes
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOption('isHtml5ParserEnabled', true);
            $pdf->setOption('isRemoteEnabled', true);

            $filename = 'Rapport_' . $examen->reference . '_' . now()->format('d-m-Y') . '.pdf';

            return $pdf->download($filename);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques mensuelles via Stored Procedure
     */
    public function getMonthlyStats()
    {
        $results = DB::select('CALL GetMonthlyAnalyses()');
        return response()->json($results);
    }
}