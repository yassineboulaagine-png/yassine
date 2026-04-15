<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Examen;

class ExamenController extends Controller
{
    public function index() {
        // Kat-jbed l-examens m3a l-mrid dyalhom deqqa wehda (Eager Loading)
        return Examen::with('patient')->latest()->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'type_analyse' => 'required|string',
            'prix' => 'required|numeric',
            'status' => 'required|in:en_cours,termine,annule'
        ]);

        // Logic d l-Reference EX-2026-001 ghadi n-zidouh f l-Model (Boot method) 
        // Bach i-koun automatique dima.
        $examen = Examen::create($data);
        return response()->json($examen, 201);
    }

    public function updateResult(Request $request, $id) {
        $examen = Examen::findOrFail($id);
        $data = $request->validate([
            'resultat' => 'required|string',
            'status' => 'required|in:termine'
        ]);

        $examen->update($data);
        return response()->json($examen);
    }

    // --- NEW: Had l-partie khassa b l-Patient Login ---
    public function patientLogin(Request $request)
    {
        // 1. Validation ديال المعطيات اللي صيفط React
        $request->validate([
            'reference' => 'required|string',
            'telephone' => 'required|string',
        ]);

        // 2. كنقلبو ف جدول examens و كنربطوه مع جدول patients باش نتأكدو من التلفون
        $examen = Examen::with(['patient', 'resultats']) // كنجيبو كاع المعلومات دقة وحدة
            ->where('reference', $request->reference)
            ->whereHas('patient', function ($query) use ($request) {
                $query->where('telephone', $request->telephone);
            })
            ->first();

        // 3. يلا مالقينا والو
        if (!$examen) {
            return response()->json([
                'success' => false,
                'message' => 'Référence ou numéro de téléphone incorrect.'
            ], 404);
        }

        // 4. يلا كاين، كنرجعو success و الداتا ديال الامتحان
        return response()->json([
            'success' => true,
            'examen' => $examen
        ], 200);
    }
}