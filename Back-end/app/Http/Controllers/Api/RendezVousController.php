<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\StatutRendezVousMail;
use App\Mail\VerificationCodeMail;
use App\Models\Patient;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class RendezVousController extends Controller
{
    public function index()
    {
        $rendezVous = RendezVous::orderBy('date_rendez_vous', 'desc')->get();

        return response()->json($rendezVous);
    }

    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:valide,annule',
            'heure_rendez_vous' => 'nullable|string',
        ]);

        $rendezVous = RendezVous::findOrFail($id);
        $rendezVous->statut = $request->statut;

        if ($request->heure_rendez_vous) {
            $rendezVous->heure_rendez_vous = $request->heure_rendez_vous;
        }

        $examen = \App\Models\Examen::find($rendezVous->analyse_id);
        if ($request->statut === 'valide') {
            if ($examen && !empty($examen->reference)) {
                $rendezVous->code_acces = $examen->reference;
            } else {
                $rendezVous->code_acces = 'EX-' . date('Y') . '-' . strtoupper(Str::random(4));
            }
        }

        $rendezVous->save();

        try {
            Mail::to($rendezVous->email)->send(new StatutRendezVousMail($rendezVous));
        } catch (\Exception $e) {
            Log::error("Erreur d'envoi mail rendez-vous: " . $e->getMessage());
        }

        return response()->json([
            'statut' => 'success',
            'message' => 'Rendez-vous mis a jour et email envoye !',
            'data' => $rendezVous,
        ]);
    }

    public function sendVerificationCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $code = rand(1000, 9999);
        Cache::put('verification_code_' . $request->email, $code, now()->addMinutes(10));

        try {
            Mail::to($request->email)->send(new VerificationCodeMail($code));

            return response()->json(['statut' => 'success', 'message' => 'Code envoye !']);
        } catch (\Exception $e) {
            return response()->json(['statut' => 'error', 'message' => 'Erreur d\'envoi d\'email'], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'telephone' => 'required|string',
            'email' => 'required|email',
            'date_rendez_vous' => 'required|date',
            'code' => 'required|integer',
            'cin' => 'required|string',
            'date_naissance' => 'required|date',
            'sexe' => 'required|string|in:M,F',
            'analyse_id' => 'nullable|exists:analyses,id',
        ]);

        $savedCode = Cache::get('verification_code_' . $request->email);

        if (!$savedCode || $request->code != $savedCode) {
            return response()->json(['statut' => 'error', 'message' => 'Code incorrect ou expire.'], 422);
        }

        $rendezVous = RendezVous::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'telephone' => $request->telephone,
            'email' => $request->email,
            'analyse_id' => $request->analyse_id,
            'date_rendez_vous' => $request->date_rendez_vous,
            'statut' => 'en_cours',
            'cin' => $request->cin,
            'date_naissance' => $request->date_naissance,
            'sexe' => $request->sexe,
        ]);

        Cache::forget('verification_code_' . $request->email);

        return response()->json([
            'statut' => 'success',
            'message' => 'Rendez-vous enregistre !',
            'data' => $rendezVous,
        ]);
    }

    public function getRendezVousValides()
    {
        $rendezVous = RendezVous::where('statut', 'valide')->get();

        return response()->json($rendezVous);
    }

    public function storeResultat(Request $request)
    {
        $request->validate([
            'ligne_examen_id' => 'required|exists:ligne_examens,id',
            'conclusion' => 'required|string',
        ]);

        $resultat = \App\Models\Resultat::create([
            'ligne_examen_id' => $request->ligne_examen_id,
            'conclusion' => $request->conclusion,
            'date_validation' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Resultat enregistre avec succes !',
            'data' => $resultat,
        ]);
    }

    public function passerAuLabo(Request $request, $id)
    {
        $request->validate([
            'type_analyse_id' => 'nullable|integer',
            'analyse_id' => 'nullable|integer',
        ]);

        $typeAnalyseId = $request->input('type_analyse_id');
        $selectedAnalyseId = $request->input('analyse_id');

        if ($selectedAnalyseId) {
            $selectedAnalyse = \App\Models\Analyse::find($selectedAnalyseId);

            if (!$selectedAnalyse) {
                return response()->json([
                    'success' => false,
                    'message' => 'Analyse selectionnee introuvable.',
                ], 422);
            }

            $typeAnalyseId = $selectedAnalyse->type_analyse_id;
        } elseif ($typeAnalyseId) {
            $typeExists = DB::table('type_analyses')->where('id', $typeAnalyseId)->exists();

            if (!$typeExists) {
                // Backward compatibility: older UI sent analyses.id under type_analyse_id.
                $selectedAnalyse = \App\Models\Analyse::find($typeAnalyseId);

                if (!$selectedAnalyse) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Type d analyse selectionne introuvable.',
                    ], 422);
                }

                $selectedAnalyseId = $selectedAnalyse->id;
                $typeAnalyseId = $selectedAnalyse->type_analyse_id;
            }
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez selectionner un type d analyse.',
            ], 422);
        }

        $rdv = RendezVous::findOrFail($id);

        $patient = Patient::firstOrCreate(
            ['cin' => $rdv->cin ?? 'CIN-' . rand(1000, 9999)],
            [
                'nom' => $rdv->nom,
                'prenom' => $rdv->prenom,
                'telephone' => $rdv->telephone,
                'email' => $rdv->email,
                'sexe' => $rdv->sexe ?? 'M',
                'date_naissance' => $rdv->date_naissance ?? now()->format('Y-m-d'),
            ]
        );

        if (!$patient->email && $rdv->email) {
            $patient->email = $rdv->email;
            $patient->save();
        }

        $analysesSub = DB::table('analyses')->where('type_analyse_id', $typeAnalyseId)->get();

        if ($analysesSub->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune analyse n est associee a ce type.',
            ], 422);
        }

        $examen = \App\Models\Examen::create([
            'patient_id' => $patient->id,
            'type_analyse_id' => $typeAnalyseId,
            'medecin_id' => \App\Models\Medecin::query()->value('id'),
            'utilisateur_id' => auth()->id() ?: \App\Models\User::query()->value('id'),
            'statut' => 'en_cours',
        ]);

        foreach ($analysesSub as $sub) {
            DB::table('ligne_examens')->insert([
                'examen_id' => $examen->id,
                'analyse_id' => $sub->id,
                'valeur_resultat' => null,
                'commentaire' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $rdv->update([
            'analyse_id' => $selectedAnalyseId ?: $analysesSub->first()->id,
            'statut' => 'valide',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Passe au labo direct avec succes !',
        ]);
    }
}
