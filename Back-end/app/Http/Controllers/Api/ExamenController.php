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
    public function index()
    {
        return Examen::with(['patient', 'lignes.analyse.typeAnalyse', 'type_analyse'])->latest()->get();
    }

    // FIX: Rejj3na l-data dial lyoum b tariqa sahla bla Carbon today
    public function getTodayExamens()
    {
        
        return Examen::with(['patient', 'lignes.analyse.typeAnalyse'])
            ->whereIn('statut', ['en_cours', 'rejete'])
            ->latest()
            ->get();
    }


    // Zid had l-fonction wast ExamenController.php
    public function getBiologisteExamens()
    {
    // Kan-jibo ghir les examens li m-validyin (statut = valide)
    return Examen::with(['patient', 'lignes.analyse.typeAnalyse'])
        ->where('statut', 'valide')
        ->latest()
        ->get();
    }

    /**
     * Get the authenticated patient's valid examination results
     */
    public function getMyResults()
    {
        // Find the patient associated with the authenticated user
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

    public function validerExamen($id)
    {
        $examen = Examen::findOrFail($id);
        
        // Set the biologist ID to the authenticated user (who is validating)
        $examen->update([
            'statut' => 'valide',
            'biologiste_id' => auth()->id()
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Prélèvement validé !'
        ]);
    }


    public function annulerExamen($id)
    {
        $examen = Examen::findOrFail($id);
        $examen->update(['statut' => 'annule']);
        
        return response()->json([
            'success' => true,
            'message' => 'Examen annulé.'
        ]);
    }

    public function getPendingValidation()
    {
        return Examen::with(['patient', 'lignes.analyse.typeAnalyse'])
            ->where('statut', 'en_validation')
            ->latest()
            ->get();
    }

    public function getHistorique()
    {
        return Examen::with(['patient', 'lignes.analyse.typeAnalyse'])
            ->where('statut', 'termine')
            ->latest()
            ->get();
    }

    public function storeResults(Request $request, $id)
    {
        $examen = Examen::findOrFail($id);
        
        $request->validate([
            'resultats' => 'required|array',
            'resultats.*.ligne_id' => 'required|integer',
            'resultats.*.valeur' => 'nullable|string',
            'resultats.*.commentaire' => 'nullable|string',
        ]);

        try {
            foreach ($request->resultats as $resultat) {
                $ligne = $examen->lignes()->find($resultat['ligne_id']);
                if ($ligne) {
                    $valeur = $resultat['valeur'] ?? null;
                    // Convert string to float if not empty
                    $valeur = !empty($valeur) ? (float) $valeur : null;
                    
                    $ligne->update([
                        'valeur_resultat' => $valeur,
                        'commentaire' => $resultat['commentaire'] ?? null,
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
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }

    public function finalApprove($id)
    {
        $examen = Examen::findOrFail($id);
        $examen->update([
            'statut' => 'termine',
            'biologiste_id' => auth()->id()  // Track which biologist validated
        ]);

        if ($examen->patient && $examen->patient->email) {
        Mail::to($examen->patient->email)->send(new ResultatExamenMail($examen));
    }

        return response()->json([
            'success' => true,
            'message' => 'Examen validé et terminé!'
        ]);
       
    }

    public function updateResult(Request $request, $id)
    {
        $examen = Examen::findOrFail($id);

        $request->validate([
            'statut' => 'required|in:en_cours,valide,termine,annule,rejete,en_validation',
        ]);

        $examen->update(['statut' => $request->statut]);
        return response()->json($examen);
    }

    public function patientLogin(Request $request)
    {
        // dd($request->all());
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

        // Generate a temporary guest token for patient authentication
        // This is a simple session token using Laravel's cache
        $token = 'guest_' . hash('sha256', $examen->id . $examen->patient->telephone . time());
        
        return response()->json([
            'success' => true,
            'examen'  => $examen,
            'token'   => $token
        ], 200);
    }

    // app/Http/Controllers/ExamenController.php
    public function reject($id) {
    $examen = Examen::find($id);
    
    if (!$examen) {
        return response()->json(['message' => 'Examen non trouvé'], 404);
    }

    // Beddel l-statut bach i-welli i-bane 3nd Anas f "Saisie"
    $examen->update(['statut' => 'rejete']); 
    
    return response()->json(['message' => 'Examen renvoyé à la saisie']);
}

    /**
     * Generate PDF Report for Examination Results
     * Fetches examen with all relationships and renders professional PDF
     */
    public function generatePDF($id)
    {
        try {
            // Fetch examen with all required relationships
            $examen = Examen::with(['lignes.analyse', 'patient', 'type_analyse'])
                ->findOrFail($id);

            // Extract data for the Blade view
            $patient = $examen->patient; 
            $lignes = $examen->lignes;

            // Generate PDF using DomPDF
            $pdf = PDF::loadView('resultats', [
                'examen' => $examen,
                'patient' => $patient,
                'lignes' => $lignes
            ]);

            // Configure PDF options
            $pdf->setPaper('A4', 'portrait');
            $pdf->setOption('isHtml5ParserEnabled', true);
            $pdf->setOption('isRemoteEnabled', true);

            // Generate filename with reference
            $filename = 'Rapport_' . $examen->reference . '_' . now()->format('d-m-Y') . '.pdf';

            // Return PDF as download
            return $pdf->download($filename);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du PDF: ' . $e->getMessage()
            ], 500);
        }
    }

        public function store(Request $request)
{
    try {

        $request->validate([
            'patient_id' => 'required|exists:patients,id',
        ]);

        $examen = Examen::create([
            'patient_id' => $request->patient_id,
            'medecin_id' => 1,
            'utilisateur_id' => auth()->id(),
            'statut' => 'en_cours',
            'reference' => 'EX-' . strtoupper(uniqid()),
            'date_examen' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Analyse créée avec succès',
            'data' => $examen
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la création de l\'examen: ' . $e->getMessage()
        ], 500);
        //

       
    }
}

public function update(Request $request, $id)
{
    // 1. كنقلبو على التحليلة بـ ID
    $examen = Examen::findOrFail($id);

    // 2. كنفيليتريو الداتا (Validation)
    $request->validate([
        'valeur' => 'required', // النتيجة ضرورية باش تولي الحالة Terminée
    ]);

    // 3. كنحدثو البيانات
    $examen->update([
        'valeur' => $request->valeur,
        'statut' => 'Terminée', // هنا فين كيتغير اللون للأخضر في الجدول
    ]);

    // 4. كنرجعو جواب لـ React بلي كولشي داز مزيان
    return response()->json([
        'message' => 'Résultat enregistré avec succès',
        'examen' => $examen
    ]);
}

public function getMonthlyStats()
{
    // هاد السطر كايعيط لـ الـ Procedure Stockée اللي كريينا الفوق
    $results = DB::select('CALL GetMonthlyAnalyses()');
    
    return response()->json($results);
}

}    