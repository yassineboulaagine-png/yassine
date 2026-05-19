<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Examen;
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
        })->latest()->get();
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'nom'            => 'required|string|max:255',
                'prenom'         => 'required|string|max:255',
                'cin'            => 'required|string|unique:patients,cin',
                'telephone'      => 'required|string',
                'sexe'           => 'required|in:M,F',
                'date_naissance' => 'required|date',
            ]);

            // ✅ SAFI — Patient seulement, pas d'exam
            $patient = Patient::create([
                'nom'            => $request->nom,
                'prenom'         => $request->prenom,
                'cin'            => $request->cin,
                'telephone'      => $request->telephone,
                'sexe'           => $request->sexe,
                'date_naissance' => $request->date_naissance,
                'user_id'        => auth()->id() ?? 3,
            ]);

            return response()->json([
                'status'  => 'success',
                'id'      => $patient->id,
                'patient' => $patient
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['status' => 'error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        $request->validate([
            'nom'            => 'required|string',
            'prenom'         => 'required|string',
            'cin'            => 'required|string|unique:patients,cin,' . $id,
            'telephone'      => 'required|string',
            'sexe'           => 'required|in:M,F',
            'date_naissance' => 'required|date',
        ]);
        $patient->update($request->only(['nom', 'prenom', 'cin', 'telephone', 'sexe', 'date_naissance']));
        return response()->json($patient);
    }

    public function destroy($id)
    {
        Patient::findOrFail($id)->delete();
        return response()->json(['message' => 'Patient supprimé']);
    }

    public function getUserStats($id)
    {
        return response()->json(['count' => Examen::where('utilisateur_id', $id)->count()]);
    }

    public function getUserPatientCount($id)
    {
        return response()->json(['patient_count' => Patient::where('user_id', $id)->count()]);
    }

    public function getBiologistStats($biologistId)
    {
        $analysesValidees = Examen::where('biologiste_id', $biologistId)->where('statut', 'valide')->count();
        $alertesPathologiques = LigneExamen::whereHas('examen', function($q) use ($biologistId) {
            $q->where('biologiste_id', $biologistId);
        })->join('analyses', 'ligne_examens.analyse_id', '=', 'analyses.id')
          ->where(function($q) {
              $q->whereRaw('CAST(ligne_examens.valeur_resultat AS DECIMAL(10,2)) > analyses.norme_max')
                ->orWhereRaw('CAST(ligne_examens.valeur_resultat AS DECIMAL(10,2)) < analyses.norme_min');
          })->count();
        return response()->json([
            'analyses_validees' => $analysesValidees,
            'alertes_pathologiques' => $alertesPathologiques
        ]);
    }

    public function exportXml($id)
    {
        $patient = Patient::findOrFail($id);

        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><patient></patient>');
        $fields = [
            'id',
            'nom',
            'prenom',
            'cin',
            'telephone',
            'sexe',
            'date_naissance',
            'created_at',
            'updated_at',
        ];

        foreach ($fields as $field) {
            $xml->addChild(
                $field,
                htmlspecialchars((string) ($patient->{$field} ?? ''), ENT_XML1 | ENT_COMPAT, 'UTF-8')
            );
        }

        return response($xml->asXML(), 200)
            ->header('Content-Type', 'application/xml')
            ->header('Content-Disposition', 'attachment; filename="patient.xml"');
    }
}
