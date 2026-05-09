<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Analyse;
use Illuminate\Http\Request;

class AnalyseController extends Controller
{
    /**
     * Get list of all analyses
     */
    public function index()
    {
        return response()->json(Analyse::with('typeAnalyse')->get());
    }

    /**
     * Store a newly created analysis
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'designation' => 'required|string',
            'prix_unitaire' => 'required|numeric',
            'unite_mesure' => 'required|string',
            'norme_min' => 'required|numeric',
            'norme_max' => 'required|numeric',
            'type_analyse_id' => 'required|exists:type_analyses,id',
        ]);

        $analyse = Analyse::create($validated);
        return response()->json($analyse, 201);
    }

    /**
     * Display the specified analysis
     */
    public function show($id)
    {
        $analyse = Analyse::with('typeAnalyse')->findOrFail($id);
        return response()->json($analyse);
    }

    /**
     * Update the specified analysis
     */
    public function update(Request $request, $id)
    {
        $analyse = Analyse::findOrFail($id);
        
        $validated = $request->validate([
            'designation' => 'sometimes|required|string',
            'prix_unitaire' => 'sometimes|required|numeric',
            'unite_mesure' => 'sometimes|required|string',
            'norme_min' => 'sometimes|required|numeric',
            'norme_max' => 'sometimes|required|numeric',
            'type_analyse_id' => 'sometimes|required|exists:type_analyses,id',
        ]);

        $analyse->update($validated);
        return response()->json($analyse);
    }

    /**
     * Remove the specified analysis
     */
    public function destroy($id)
    {
        $analyse = Analyse::findOrFail($id);
        $analyse->delete();
        return response()->json(['message' => 'Analyse supprimée']);
    }
}
