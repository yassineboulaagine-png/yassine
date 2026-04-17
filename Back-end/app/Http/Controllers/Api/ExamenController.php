<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Examen;

class ExamenController extends Controller
{
    // جيب كاع الـ examens مع بيانات المريض
    public function index()
    {
        return Examen::with('patient')->latest()->get();
    }

    // بدل statut ديال examen
    public function updateResult(Request $request, $id)
    {
        $examen = Examen::findOrFail($id);

        $request->validate([
            'statut' => 'required|in:en_attente,en_cours,termine,annule',
        ]);

        $examen->update(['statut' => $request->statut]);
        return response()->json($examen);
    }

    // Login ديال المريض بـ reference + telephone
    public function patientLogin(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
            'telephone' => 'required|string',
        ]);

        $examen = Examen::with(['patient', 'resultats'])
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