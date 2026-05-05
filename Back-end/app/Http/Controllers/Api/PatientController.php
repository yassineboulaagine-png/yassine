<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Examen;
use App\Models\Analyse;
use App\Models\LigneExamen;


class PatientController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        return Patient::when($search, function($query) use ($search) {
            return $query->where('cin', 'LIKE', "%{$search}%")
                         ->orWhere('nom', 'LIKE', "%{$search}%")
                         ->orWhere('prenom', 'LIKE', "%{$search}%");
        })
        ->latest()
        ->get();
    }

    public function store(Request $request)
    {
        // Check if this is a new exam for an existing patient or a new patient registration
        $isNewExam = $request->has('patient_id') && $request->patient_id;

        // 1. Validation dial l-data li jaya men React
        if ($isNewExam) {
            // For new exam on existing patient, only validate patient_id and analysis
            $request->validate([
                'patient_id'     => 'required|exists:patients,id',
                'utilisateur_id' => 'required|exists:utilisateurs,id',
                'medecin_id'     => 'required|exists:medecins,id',
                'nom_analyse'    => 'required|string',
            ]);
            $patient_id = $request->patient_id;
        } else {
            // For new patient, validate all patient info
            $request->validate([
                'nom'            => 'required|string',
                'prenom'         => 'required|string',
                'cin'            => 'required|string|unique:patients,cin',
                'telephone'      => 'required|string|size:10',
                'sexe'           => 'required|in:M,F',
                'date_naissance' => 'required|date',
                'utilisateur_id' => 'required|exists:utilisateurs,id',
                'medecin_id'     => 'required|exists:medecins,id',
                'nom_analyse'    => 'required|string',
            ]);

            // 2. Création dial l-Patient (only if not existing)
            $patient = Patient::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'cin' => $request->cin,
                'telephone' => $request->telephone,
                'sexe' => $request->sexe,
                'date_naissance' => $request->date_naissance,
                'user_id' => $request->utilisateur_id
            ]);
            
            $patient_id = $patient->id;
        }

        // 3. Création dial l-Examen (biha kaye-t-generer l-Reference automatique f l-Model)
        $examen = Examen::create([
            'patient_id'     => $patient_id,
            'utilisateur_id' => $request->utilisateur_id,
            'medecin_id'     => $request->medecin_id,
            'statut'         => 'en_cours',
        ]);

        // 4. L-7ELL: Enregistrement dial l-ligne d'examen
        // Kan-9lbo 3la l-ID dial l-analyse f table 'analyses' b-smit l-khayar li t-khtar
        // Uses LIKE to handle partial matches between frontend nom_analyse and database designation
        $nom_saisi = $request->nom_analyse; 

        // كنقلبو على التحليلة اللي السمية ديالها كاينا وسط النص اللي جا من React
        $analyse = \App\Models\Analyse::all()->filter(function($item) use ($nom_saisi) {
            return str_contains(strtolower($nom_saisi), strtolower($item->designation));
        })->first();

        if ($analyse) {
            LigneExamen::create([
                'examen_id'       => $examen->id,
                'analyse_id'      => $analyse->id,
                'valeur_resultat' => null,
                'commentaire'     => null,
            ]);
        }

        return response()->json([
            'patient_id' => $patient_id,
            'reference'  => $examen->reference,
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

    public function getUserStats($id)
    {
        $count = Examen::where('utilisateur_id', $id)->count();
        return response()->json(['count' => $count]);
    }

    /**
     * Get patient count for a specific user (Préleveur)
     */
    public function getUserPatientCount($id)
    {
        $count = Patient::where('user_id', $id)->count();
        return response()->json(['patient_count' => $count]);
    }
}