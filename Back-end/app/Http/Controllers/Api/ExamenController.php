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
use App\Models\LigneExamen;
use App\Models\Analyse;
use App\Models\Patient;
use App\Models\Notification;
use App\Models\RendezVous;
use App\Models\Resultat;



class ExamenController extends Controller
{
    private function notificationStatusValue(bool $wasSent): string
    {
        $accentedE = chr(195) . chr(169);

        return $wasSent ? 'envoy' . $accentedE : $accentedE . 'chec';
    }

    private function logExamEmailNotification(Examen $examen, string $message, bool $wasSent): void
    {
        try {
            Notification::create([
                'message' => substr($message, 0, 250),
                'canal' => 'email',
                'statut' => $this->notificationStatusValue($wasSent),
                'date_envoi' => now(),
                'examen_id' => $examen->id,
            ]);
        } catch (\Throwable $e) {
            \Log::warning('Unable to log email notification', [
                'examen_id' => $examen->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function sendExamEmailAndTrack(Examen $examen, $mailable, string $successMessage, string $failureMessage): void
    {
        $examen->loadMissing('patient');
        $recipientEmail = $this->resolveExamRecipientEmail($examen);

        if (!$recipientEmail) {
            $this->logExamEmailNotification($examen, $failureMessage . ': patient sans email', false);
            return;
        }

        try {
            Mail::to($recipientEmail)->send($mailable);

            $this->logExamEmailNotification(
                $examen,
                $successMessage . ': ' . $recipientEmail,
                true
            );
        } catch (\Throwable $e) {
            \Log::error('Exam email send failed', [
                'examen_id' => $examen->id,
                'patient_email' => $recipientEmail,
                'error' => $e->getMessage(),
            ]);

            $this->logExamEmailNotification(
                $examen,
                $failureMessage . ': ' . $e->getMessage(),
                false
            );
        }
    }

    private function resolveExamRecipientEmail(Examen $examen): ?string
    {
        $patient = $examen->patient;

        if (!$patient) {
            return null;
        }

        if (!empty($patient->email)) {
            return $patient->email;
        }

        if (empty($patient->cin) && empty($patient->telephone)) {
            return null;
        }

        $rendezVousQuery = RendezVous::query()
            ->whereNotNull('email')
            ->where('email', '<>', '');

        $rendezVousQuery->where(function ($query) use ($patient) {
            if (!empty($patient->cin)) {
                $query->where('cin', $patient->cin);
            }

            if (!empty($patient->telephone)) {
                $query->orWhere('telephone', $patient->telephone);
            }
        });

        $rendezVous = $rendezVousQuery->latest()->first();

        if (!$rendezVous) {
            return null;
        }

        $patient->email = $rendezVous->email;
        $patient->save();

        return $rendezVous->email;
    }

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
     * Enregistrer les résultats (Par l'Admin / Préleveur)
     */
    public function storeResults(Request $request, $id)
    {
        \Log::info('📥 storeResults REQUEST RECEIVED:', [
            'examen_id' => $id,
            'all_data' => $request->all()
        ]);

        $examen = Examen::findOrFail($id);

        try {
            // 1. Check if data comes as an array or direct input from React
            if ($request->has('resultats') && is_array($request->resultats)) {
                foreach ($request->resultats as $resultat) {
                    $ligne = $examen->lignes()->find($resultat['ligne_id']);
                    if ($ligne) {
                        $valeur = $resultat['valeur'] ?? null;
                        $valeurClean = ($valeur !== null && $valeur !== '') ? (float)str_replace(',', '.', $valeur) : null;
                        
                        $ligne->update([
                            'valeur_resultat' => $valeurClean,
                            'commentaire' => $resultat['commentaire'] ?? null
                        ]);
                    }
                }
            } else {
                // Fallback: If React sends direct input fields instead of an array
                $ligne = \App\Models\LigneExamen::where('examen_id', $id)->first();
                if ($ligne) {
                    $valeurInput = $request->valeur ?? $request->valeur_resultat ?? $request->input('resultats.0.valeur');
                    $valeurClean = ($valeurInput !== null && $valeurInput !== '') ? (float)str_replace(',', '.', $valeurInput) : null;

                    \Log::info('💾 Saving via storeResults (Direct Input Fallback):', ['valeur_clean' => $valeurClean]);

                    $ligne->update([
                        'valeur_resultat' => $valeurClean,
                        'commentaire' => $request->commentaire ?? $request->input('resultats.0.commentaire') ?? null
                    ]);
                }
            }

            // 2. FORCE 'valide' status so Cards calculate it and PDF displays the number
            $examen->update([
                'statut' => 'en_validation' // نغيروها لـ 'en_validation' باش البايولوجيست يشوفها فـ Pending Validation ويعطيها Validation نهائية
            ]);

            $this->sendExamEmailAndTrack(
                $examen,
                new \App\Mail\VerificationCodeMail($examen->reference),
                'Email reference examen envoye au patient',
                'Echec email reference examen'
            );

            \Log::info('✨ storeResults SUCCESS: Status strictly updated to valide');

            return response()->json([
                'success' => true,
                'message' => 'Résultats enregistrés et validés avec succès',
                'examen' => $examen->load('lignes')
            ], 200);

        } catch (\Exception $e) {
            \Log::error('❌ Error in storeResults: ' . $e->getMessage());
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

        $this->sendExamEmailAndTrack(
            $examen,
            new \App\Mail\VerificationCodeMail($examen->reference),
            'Email reference examen envoye au patient',
            'Echec email reference examen'
        );

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
        return Examen::with(['patient', 'lignes.analyse.typeAnalyse', 'lignes.resultats'])
            ->where('statut', 'en_validation')
            ->latest()
            ->get();
    }

    /**
     * Historique des examens terminés
     */
    public function getHistorique()
    {
        return Examen::with(['patient', 'lignes.analyse.typeAnalyse', 'lignes.resultats'])
            ->where('statut', 'termine')
            ->latest()
            ->get();
    }

    /**
     * Approbation finale d'un examen (Par le Biologiste)
     */
    public function finalApprove(Request $request, $id)
    {
        $validated = $request->validate([
            'conclusion' => 'nullable|string|max:1000',
            'conclusions' => 'nullable|array',
            'conclusions.*' => 'nullable|string|max:1000',
        ]);

        $examen = Examen::with('lignes')->findOrFail($id);
        $validatedAt = now();

        DB::transaction(function () use ($examen, $validated, $validatedAt) {
            $examen->update([
                'statut' => 'termine',
                'biologiste_id' => auth()->id()
            ]);

            $defaultConclusion = trim($validated['conclusion'] ?? '');
            if ($defaultConclusion === '') {
                $defaultConclusion = 'Resultat valide';
            }

            $lineConclusions = $validated['conclusions'] ?? [];

            foreach ($examen->lignes as $ligne) {
                $conclusion = trim((string) ($lineConclusions[$ligne->id] ?? $defaultConclusion));

                Resultat::create([
                    'ligne_examen_id' => $ligne->id,
                    'conclusion' => $conclusion === '' ? $defaultConclusion : $conclusion,
                    'date_validation' => $validatedAt,
                ]);
            }
        });

        $this->sendExamEmailAndTrack(
            $examen,
            new ResultatExamenMail($examen),
            'Email resultats examen envoye au patient',
            'Echec email resultats examen'
        );

        return response()->json([
            'success' => true,
            'message' => 'Examen valide et termine!',
            'data' => $examen->load(['patient', 'lignes.analyse.typeAnalyse', 'lignes.resultats'])
        ]);
    }
    /**
     * Mettre à jour le statut et la valeur d'un examen dynamically
     */
    public function updateResult(Request $request, $id)
    {
        \Log::info('📥 updateResult REQUEST RECEIVED:', [
            'examen_id' => $id,
            'all_data' => $request->all()
        ]);

        $examen = Examen::findOrFail($id);

        $request->validate([
            'statut' => 'required|in:en_cours,valide,termine,annule,rejete,en_validation',
        ]);

        try {
            $ligne = \App\Models\LigneExamen::where('examen_id', $id)->first();
            if ($ligne) {
                $valeurInput = $request->valeur ?? $request->valeur_resultat;
                if ($valeurInput !== null) {
                    $valeurClean = ($valeurInput !== '') ? (float)str_replace(',', '.', $valeurInput) : null;
                    
                    \Log::info('💾 Saving via updateResult:', ['valeur_clean' => $valeurClean]);
                    
                    $ligne->update([
                        'valeur_resultat' => $valeurClean,
                        'commentaire' => $request->commentaire ?? $ligne->commentaire
                    ]);
                }
            }

            // Dynamically updates based on the exact react instruction
            $updated = $examen->update([
                'statut' => $request->statut
            ]);

            \Log::info('✨ updateResult COMPLETED SUCCESSFULLY');

            $statutInput = $request->input('statut');
        $examen->update(['statut' => $statutInput]);

        $examen->load('patient');

        // 2. 🔥 الـ نـوتـيـفـيـكـاسـيـون الأوتوماتيكية:
        // كيتأكد بلي الـ statut رجع "valide" والمريض عنده إيميل
        if ($statutInput === 'valide') {
    if ($examen->patient) {
        // 🚀 هادي لّي زِدنا: كادّوز الـ reference (الـ كود) الصّحيح نِيت لّي تْـسِيفا ف الـ Base
        $this->sendExamEmailAndTrack(
            $examen,
            new \App\Mail\VerificationCodeMail($examen->reference),
            'Email reference examen envoye au patient',
            'Echec email reference examen'
        );
    }
} elseif ($statutInput === 'termine') {
    if ($examen->patient) {
        // هادي كادّوز المايل د النتائج ف الـلّخر ملي الـ بيولوجيست كايْفِينِي التحليلة
        $this->sendExamEmailAndTrack(
            $examen,
            new \App\Mail\ResultatExamenMail($examen),
            'Email resultats examen envoye au patient',
            'Echec email resultats examen'
        );
    }
}

            return response()->json([
                'success' => true,
                'examen' => $examen->load('lignes')
            ]);

        } catch (\Exception $e) {
            \Log::error('❌ Error in updateResult: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }


    }
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
            // 1. جلب البيانات مع العلاقات كاملين
            $examen = Examen::with(['lignes.analyse', 'patient', 'type_analyse'])
                ->findOrFail($id);

            $patient = $examen->patient;
            $lignes  = $examen->lignes;

            // 2. توليد الـ PDF ف الـ الـ ذاكرة (Memory)
            $pdf = \PDF::loadView('resultats', [
                'examen'  => $examen,
                'patient' => $patient,
                'lignes'  => $lignes
            ]);
            
            $pdf->setPaper('A4', 'portrait');

            $filename = 'Rapport_' . $examen->reference . '_' . now()->format('d-m-Y') . '.pdf';

            // 🌟 3. ها هو السطر لّي كاتقلّب عليه محطوط هنا ف الـلّخر ديال الـ try:
            return $pdf->stream($filename, [
                "Content-Type" => "application/pdf",
                "Content-Disposition" => "attachment; filename=\"" . $filename . "\""
            ]);

        } catch (\Exception $e) {
            \Log::error('❌ PDF Generation Error: ' . $e->getMessage());
            
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
