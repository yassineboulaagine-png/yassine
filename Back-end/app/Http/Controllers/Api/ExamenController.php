<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Examen;

class ExamenController extends Controller
{
    public function index()
    {
        return Examen::with(['patient', 'lignes.analyse'])->latest()->get();
    }

    // FIX: Rejj3na l-data dial lyoum b tariqa sahla bla Carbon today
    public function getTodayExamens()
    {
        
        return Examen::with(['patient', 'lignes.analyse'])
            
            ->latest()
            ->get();
    }


    // Zid had l-fonction wast ExamenController.php
    public function getBiologisteExamens()
    {
    // Kan-jibo ghir les examens li m-validyin (statut = valide)
    return Examen::with(['patient', 'lignes.analyse'])
        ->where('statut', 'valide')
        ->latest()
        ->get();
    }


    public function validerExamen($id)
    {
        $examen = Examen::findOrFail($id);
        $examen->update(['statut' => 'valide']);
        
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

    public function updateResult(Request $request, $id)
    {
        $examen = Examen::findOrFail($id);

        $request->validate([
            'statut' => 'required|in:en_attente,en_cours,valide,termine,annule',
        ]);

        $examen->update(['statut' => $request->statut]);
        return response()->json($examen);
    }

    public function patientLogin(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
            'telephone' => 'required|string',
        ]);

        $examen = Examen::with(['patient', 'resultats', 'lignes.analyse'])
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

        return response()->json([
            'success' => true,
            'examen'  => $examen
        ], 200);
    }
}