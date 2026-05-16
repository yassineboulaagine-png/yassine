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
$examens = Examen::with(['patient', 'type_analyse'])->whereDate('created_at', now())->get();
               

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
        return Examen::with(['patient','type_analyse', 'lignes.analyse.typeAnalyse'])
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
     * DEBUG: Comprehensive logging pour debuguer type_analyse_id NULL
     */
    public function store(Request $request)
    {
        try {
            // ─── STEP 1: Log Raw Request Data ───────────────────────
            \Log::info('📥 RAW REQUEST DATA:', [
                'all'     => $request->all(),
                'json'    => $request->json()->all(),
                'input'   => $request->input(),
            ]);

            // ─── STEP 2: Log Individual Fields ──────────────────────
            \Log::info('🔍 INDIVIDUAL FIELDS:', [
                'patient_id'      => $request->patient_id,
                'type_analyse_id' => $request->type_analyse_id,
                'medecin_id'      => $request->medecin_id,
            ]);

            // ─── STEP 3: Validate with Detailed Messages ────────────
            $validated = $request->validate([
                'patient_id'      => 'required|exists:patients,id',
                'type_analyse_id' => 'required|exists:type_analyses,id',
            ]);

            \Log::info('✅ VALIDATION PASSED:', $validated);

            // ─── STEP 4: Log Before Create ──────────────────────────
            $createData = [
                'patient_id'      => $request->patient_id,
                'type_analyse_id' => $request->type_analyse_id,
                'medecin_id'      => $request->medecin_id ?? 1,
                'utilisateur_id'  => auth()->id(),
                'statut'          => 'en_cours',
            ];

            \Log::info('📝 DATA BEFORE CREATE:', $createData);

            // ─── STEP 5: Create and Log Result ──────────────────────
           $examen = Examen::create($createData);

    // ✅ هاد الجزء هو اللي ناقصك باش تعمر جدول ligne_examens
    // كنجيبو كاع الـ analyses اللي تابعين لهاد نوع التحليلة (Hématologie مثلا)
    $analyses = \App\Models\Analyse::where('type_analyse_id', $examen->type_analyse_id)->get();

    foreach ($analyses as $analyse) {
        \App\Models\LigneExamen::create([
            'examen_id' => $examen->id,
            'analyse_id' => $analyse->id,
            'valeur_resultat' => null, // كيبقى خاوي فالبداية
            'commentaire' => null
        ]);
    }

    \Log::info('✨ EXAMEN & LIGNES CREATED:', [
        'id' => $examen->id,
        'lignes_count' => $analyses->count(),
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Examen et lignes créés avec succès',
        'data'    => $examen->load(['patient', 'type_analyse', 'lignes']) // ✅ زدنا lignes هنا
    ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('❌ VALIDATION FAILED:', $e->errors());
            
            return response()->json([
                'success' => false,
                'errors'  => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('💥 EXCEPTION:', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Saisir les résultats d'un examen
     */
   public function storeResults(Request $request, $id)
{
    // 1. 🚨 جلب الـ Examen أول حاجة (كانت ناقصة عندك ف السكرين!)
    $examen = Examen::findOrFail($id);

    // 2. الـ Validation
    $request->validate([
        'resultats' => 'required|array',
        'resultats.*.ligne_id' => 'required|integer',
        'resultats.*.valeur' => 'nullable|string',
        'resultats.*.commentaire' => 'nullable|string',
    ]);

    try {
        // 3. الـ Loop باستعمال الـ Model ديريكت باش نقطعو الشك ف الـ Relation
        foreach ($request->resultats as $resultat) {
            
            // 🛠️ هنا دق ف الباب ديال الـ Model ديريكت بـ الـ ID ديال الـ السطر
            // وتأكد باللي هاد السطر تابع للـ Examen ديالنا
            $ligne = \App\Models\LigneExamen::where('id', $resultat['ligne_id'])
                                            ->where('examen_id', $id)
                                            ->first();
            
            if ($ligne) {
                $valeur = $resultat['valeur'] ?? null;
                // تنظيف وتحويل القيمة لـ float
                $valeurClean = ($valeur !== null && $valeur !== '') ? (float)str_replace(',', '.', $valeur) : null;

                $ligne->update([
                    'valeur_resultat' => $valeurClean,
                    'commentaire' => $resultat['commentaire'] ?? null
                ]);
            }
        }

        // 4. تحديث الـ Statut ديال الفحص لـ 'termine'
        $examen->update([
            'statut' => 'termine'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Résultats enregistrés avec succès',
            'examen' => $examen->load('lignes')
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
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
   

    /**
     * Rejeter un examen (renvoyer à la saisie)
     */
   public function reject($id)
{
    try {
        // كنستعملو \App\Models\Examen باش نقطعو الشك فـ Namespace
        $examen = \App\Models\Examen::find($id);

        if (!$examen) {
            return response()->json(['message' => 'Examen non trouvé'], 404);
        }

        // تبديل الحالة
        $examen->statut = 'rejete';
        $examen->save(); // save() حسن من update() فـ التيست حيت كتعطيك Error واضحة

        return response()->json([
            'success' => true,
            'message' => 'Examen renvoyé à la saisie',
            'data' => $examen
        ]);

    } catch (\Exception $e) {
        // هاد السطر غايخليك تشوف المشكل الحقيقي فـ laravel.log
        \Log::error("Reject Error ID $id: " . $e->getMessage());
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
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