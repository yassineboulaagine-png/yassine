<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationCodeMail;
use App\Models\RendezVous;
use App\Models\Patient;
use App\Models\examen;

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
        'heure_rendez_vous' => 'nullable|string' // الـ وقيّتة لّي غايعزل الـ بريلفور
    ]);

    $rendezVous = RendezVous::findOrFail($id);
    
    // 🌟 حـفـظ الـتـغـيـيـرات ف الـ جـدول
    $rendezVous->statut = $request->statut;
    
    if ($request->heure_rendez_vous) {
        $rendezVous->heure_rendez_vous = $request->heure_rendez_vous;
    }

    // 🔑 إيلا كان الـ statut رجع 'valide' وماعندوش ديجا كود، غانصاوبو ليه واحد أوتوماتيك
    if ($request->statut === 'valide' && empty($rendezVous->code_acces)) {
        // غايصاوب كود فريد بحال: LAB-A83B1
        $rendezVous->code_acces = 'LAB-' . strtoupper(\Illuminate\Support\Str::random(5));
    }

    $rendezVous->save();

    // 🚀 صيفط النوتيفيكاسيون ديريكت للـ مريض ف الـ Mailtrap!
    try {
        // دابا الـ $rendezVous غايمشي ومعاه الـ code_acces الجديد ديالو ناضي
        \Illuminate\Support\Facades\Mail::to($rendezVous->email)->send(new \App\Mail\StatutRendezVousMail($rendezVous));
    } catch (\Exception $e) {
        // وخا يفشل المايل مايتبلوكاش السيستم
    }

    return response()->json([
        'statut' => 'success', 
        'message' => 'Rendez-vous mis à jour et email envoyé !', 
        'data' => $rendezVous
    ]);
}







    public function sendVerificationCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $code = rand(1000, 9999);
        Cache::put('verification_code_' . $request->email, $code, now()->addMinutes(10));

        try {
            Mail::to($request->email)->send(new VerificationCodeMail($code));
            return response()->json(['statut' => 'success', 'message' => 'Code envoyé !']);
        } catch (\Exception $e) {
            return response()->json(['statut' => 'error', 'message' => 'Erreur d\'envoi d\'email'], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
           'nom'               => 'required|string',
        'prenom'            => 'required|string',
        'telephone'         => 'required|string',
        'email'             => 'required|email',
        'date_rendez_vous'  => 'required|date',
        'code'              => 'required|integer',
        
        'cin'               => 'required|string',
        'date_naissance'    => 'required|date',
        'sexe'              => 'required|string|in:M,F',
        'analyse_id'        => 'nullable|exists:analyses,id'
        ]);

        $savedCode = Cache::get('verification_code_' . $request->email);

        if (!$savedCode || $request->code != $savedCode) {
            return response()->json(['statut' => 'error', 'message' => 'Code incorrect ou expiré.'], 422);
        }

       $rendezVous = RendezVous::create([
           'nom'               => $request->nom,
        'prenom'            => $request->prenom,
        'telephone'         => $request->telephone,
        'email'             => $request->email,
        'analyse_id'        => $request->analyse_id,
        'date_rendez_vous'  => $request->date_rendez_vous,
        'statut'            => 'en_cours',
        
        
        'cin'               => $request->cin,
        'date_naissance'    => $request->date_naissance,
        'sexe'              => $request->sexe,
        ]);
        Cache::forget('verification_code_' . $request->email);

        return response()->json(['statut' => 'success', 'message' => 'Rendez-vous enregistré !', 'data' => $rendezVous]);
    }

    // 1. دالة كاتجيب كاع المواعيد لّي حالتهم valide ومازال ماعندهمش نتيجة
public function getRendezVousValides() {
    $rendezVous = RendezVous::where('statut', 'valide')
        // هادي غاتخليه يجيب غير المواعيد لّي مازال ماتقادو ليوم النتائج ف طابلو resultats
        ->whereDoesntHave('ligneExamens.resultat') 
        ->get();

    return response()->json($rendezVous);
}

// 2. دالة كاتخزن النتيجة والـ commentaire (conclusion) ف طابلو resultats
public function storeResultat(Request $request) {
    $request->validate([
        'ligne_examen_id' => 'required|exists:ligne_examens,id',
        'conclusion' => 'required|string',
    ]);

    // كامتكرياو السطر الجديد ف الطابلو لّي وريتيني ف HeidiSQL
    $resultat = \App\Models\Resultat::create([
        'ligne_examen_id' => $request->ligne_examen_id,
        'conclusion' => $request->conclusion,
        'date_validation' => now(), // التاريخ والوقت دابا أوتوماتيك
    ]);

    return response()->json(['success' => true, 'message' => 'Résultat enregistré avec succès !', 'data' => $resultat]);
}

public function passerAuLabo(Request $request, $id)
{
    // 1. 🚀 لغينا الـ Validation بمرة باش ما تحبسناش!
    // غانقراو الـ ID د التحليلة، وإيلا مالقاهاش ف الـ request غايمشي يعطيها 1 أوتوماتيك (NFS) كـ حل مؤقت
    $analyseId = $request->input('analyse_id', 1);

    // 2. كنجيبو الموعد من الداتابيز بـ الـ ID
    $rdv = RendezVous::findOrFail($id);

    // 3. 🛡️ كـنكريو المريض ف جدول Patients (البحث بـ الـ CIN)
    $patient = Patient::firstOrCreate(
        ['cin' => $rdv->cin ?? 'CIN-' . rand(1000, 9999)], // إيلا مكانش الـ cin عامر كيعطيه كود عشوائي
        [
            'nom'            => $rdv->nom,
            'prenom'         => $rdv->prenom,
            'telephone'      => $rdv->telephone,
            'email'          => $rdv->email,
            'sexe'           => $rdv->sexe ?? 'M',
            'date_naissance' => $rdv->date_naissance ?? now()->format('Y-m-d'),
        ]
    );

    // 4. 🧪 كنكريو السطر ف جدول الـ Examens (باش تطلع نيشان ف الـ Analyses du jour)
   $examen= \App\Models\Examen::create([
        'patient_id' => $patient->id, 
        'type_analyse_id' => $analyseId, 
        'statut'     => 'en_cours'
    ]);

    $analysesSub = \DB::table('analyses')->where('type_analyse_id', $analyseId)->get(); // أو على حساب كفاش رابطهم ف الـ DB


    if ($analysesSub->count() > 0) {
        foreach ($analysesSub as $sub) {
            \DB::table('ligne_examens')->insert([
                'examen_id'         => $examen->id,
                'analyse_id'        => $sub->id, // الـ ID د التحليلة الفرعية (مثلاً Glycémie)
                'valeur_resultat'   => null,
                'commentaire'       => null,
                'created_at'        => now(),
                'updated_at'        => now()
            ]);
        }
    } else {
        // 🛡️ خطة احتياطية أوتوماتيكية: إيلا مالقاش ربط ف جدول الـ analyses، غادي يصاوب ليه سطر تجريبي بـ نفس الـ ID د التحليلة
        \DB::table('ligne_examens')->insert([
            'examen_id'         => $examen->id,
            'analyse_id'        => $analyseId,
            'valeur_resultat'   => null,
            'commentaire'       => null,
            'created_at'        => now(),
            'updated_at'        => now()
        ]);
    }

    // 5. كنرجعو الموعد 'traite' باش يختفى من الـ Dashboard ويتحول للـ المختبر
    $rdv->update([
        'analyse_id' => $analyseId,
        'statut'     => 'valide'
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Passé au labo direct avec succès !'
    ]);
}
}