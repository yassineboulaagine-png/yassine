<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;

class PatientController extends Controller
{
    // 1. عرض المرضى (الأحدث أولاً)
    public function index() {
        return Patient::latest()->get();
    }

    // 2. تسجيل مريض جديد
    public function store(Request $request) {
        $data = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'cin'            => 'nullable|string|unique:patients,cin',
            'telephone'      => 'required|string',
            'date_naissance' => 'required|date',
            'sexe'           => 'required|in:M,F',
        ]);

        $patient = Patient::create($data);

        return response()->json([
            'message' => 'Patient créé avec succès',
            'patient' => $patient
        ], 201);
    }

    // 3. عرض مريض واحد مع سجل التحاليل ديالو
    public function show($id) {
        return Patient::with('examens')->findOrFail($id);
    }

    // 4. التعديل (Update) - هادي ضرورية للـ CRUD الكامل
    public function update(Request $request, $id) {
        $patient = Patient::findOrFail($id);

        $data = $request->validate([
            'nom'            => 'sometimes|required|string|max:100',
            'prenom'         => 'sometimes|required|string|max:100',
            'cin'            => 'sometimes|nullable|string|unique:patients,cin,' . $id,
            'telephone'      => 'sometimes|required|string',
            'date_naissance' => 'sometimes|required|date',
            'sexe'           => 'sometimes|required|in:M,F',
        ]);

        $patient->update($data);

        return response()->json([
            'message' => 'Patient mis à jour avec succès',
            'patient' => $patient
        ]);
    }

    // 5. المسح (Delete)
    public function destroy($id) {
        $patient = Patient::findOrFail($id);
        $patient->delete();
        return response()->json(['message' => 'Patient supprimé avec succès']);
    }
}