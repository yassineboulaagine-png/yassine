<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Examen;

class PatientController extends Controller
{
    public function index()
    {
        return Patient::latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom'            => 'required|string',
            'prenom'         => 'required|string',
            'cin'            => 'required|string|unique:patients,cin',
            'telephone'      => 'required|string|size:10',
            'sexe'           => 'required|in:M,F',
            'date_naissance' => 'required|date',
            'utilisateur_id' => 'required|exists:utilisateurs,id',
            'medecin_id'     => 'required|exists:medecins,id',
        ]);

        $patient = Patient::create($request->only([
            'nom', 'prenom', 'cin', 'telephone', 'sexe', 'date_naissance'
        ]));

        $examen = Examen::create([
            'patient_id'     => $patient->id,
            'utilisateur_id' => $request->utilisateur_id,
            'medecin_id'     => $request->medecin_id,
            'statut'         => 'en_cours',
        ]);

        return response()->json([
            'patient'   => $patient,
            'reference' => $examen->reference,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $request->validate([
            'nom'            => 'required|string',
            'prenom'         => 'required|string',
            'cin'            => 'required|string|unique:patients,cin,' . $id,
            'telephone'      => 'required|string|size:10',
            'sexe'           => 'required|in:M,F',
            'date_naissance' => 'required|date',
        ]);

        $patient->update($request->only([
            'nom', 'prenom', 'cin', 'telephone', 'sexe', 'date_naissance'
        ]));

        return response()->json($patient);
    }

    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();
        return response()->json(['message' => 'Patient supprimé']);
    }

    // --- HAD LA FONCTION HIYA LI KHASSAK BACH T-7EL L-404 ---
    public function getUserStats($id)
    {
        // Kan-7sbo ch7al men examen dar had l-utilisateur (prélèveur)
        $count = Examen::where('utilisateur_id', $id)->count();
        return response()->json(['count' => $count]);
    }
}