<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;   
use App\Models\Patient;
use App\Models\Examen;
use Illuminate\Support\Facades\DB; 

class DashboardController extends Controller
{
    public function getAdminStats()
    {
        // 1. حساب الأرقام الإجمالية للـ Cards
        $totalPatients = Patient::count();
        $analysesValidees = Examen::where('statut', 'Valide')->count(); // أو 'Terminé' على حسب شنو داير
        $analysesEnCours = Examen::where('statut', 'en_cours')->count(); // أو 'En attente'

        // 2. جلب بيانات الـ Graph (مثلاً: عدد التحاليل Validées في كل شهر من هاد العام)
        $graphData = Examen::where('statut', 'Valide')
            ->whereYear('created_at', date('Y'))
            ->select(DB::raw('MONTH(created_at) as month'), DB::raw('count(*) as count'))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        // تحويل أرقام الشهور لسميات بالفرنسية باش يفهمها الـ Graph
        $monthsNames = [1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Juin', 7 => 'Juil', 8 => 'Août', 9 => 'Sept', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'];
        
        $formattedGraphData = [];
        foreach ($graphData as $data) {
            $formattedGraphData[] = [
                'name' => $monthsNames[$data->month],
                'analyses' => $data->count
            ];
        }

        // 3. إرجاع كاع البيانات فـ Response وحدة
        return response()->json([
            'cards' => [
                'total_patients' => $totalPatients,
                'analyses_validees' => $analysesValidees,
                'en_cours' => $analysesEnCours,
            ],
            'graph' => $formattedGraphData
        ], 200);
    }
}
