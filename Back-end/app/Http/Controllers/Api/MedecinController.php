<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medecin;
use Illuminate\Http\Request;

class MedecinController extends Controller
{
    /**
     * Get list of all doctors
     */
    public function index()
    {
        return response()->json(Medecin::all());
    }

    /**
     * Store a newly created doctor
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'specialite' => 'required|string',
            'telephone' => 'required|string',
            'adresse' => 'nullable|string',
        ]);

        $medecin = Medecin::create($validated);
        return response()->json($medecin, 201);
    }

    /**
     * Display the specified doctor
     */
    public function show($id)
    {
        $medecin = Medecin::findOrFail($id);
        return response()->json($medecin);
    }

    /**
     * Update the specified doctor
     */
    public function update(Request $request, $id)
    {
        $medecin = Medecin::findOrFail($id);
        
        $validated = $request->validate([
            'nom' => 'sometimes|required|string',
            'prenom' => 'sometimes|required|string',
            'specialite' => 'sometimes|required|string',
            'telephone' => 'sometimes|required|string',
            'adresse' => 'nullable|string',
        ]);

        $medecin->update($validated);
        return response()->json($medecin);
    }

    /**
     * Remove the specified doctor
     */
    public function destroy($id)
    {
        $medecin = Medecin::findOrFail($id);
        $medecin->delete();
        return response()->json(['message' => 'Médecin supprimé']);
    }
}
