<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Examen;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    public function index()
    {
        $staff = User::whereIn('role', ['biologiste', 'preleveur'])
                     ->orderBy('created_at', 'desc')
                     ->get();

        return response()->json($staff, 200);
    }

    // 2. إضافة مستخدم جديد (Staff) للـ مختبر
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:utilisateurs,email',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['biologiste', 'preleveur'])],
        ]);

        $adminLaboratoireId = auth()->user()->laboratoire_id;

        $user = new User();
        $user->nom_complet = $validated['name']; // 🛠️ هنا كنعطيو الاسم للعمود الحقيقي
        $user->email = $validated['email'];
        $user->password = Hash::make($validated['password']);
        $user->role = $validated['role'];
        $user->laboratoire_id = $adminLaboratoireId; // ربط المستخدم بالمختبر ديال الأدمين
        $user->save(); // حفظ فالداتابيز

        return response()->json([
            'message' => 'Membre du staff ajouté avec succès',
            'user' => $user
        ], 201);
    }

    // 3. حذف مستخدم من الـ السيستيم
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // حماية: لادمن ما يقدرش يمسح راسو بالغلظ من هنا
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }
}
