<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // 1. ليستة ديال كاع الموظفين (غير لـ Admin)
    public function index() {
        return User::all();
    }

    // 2. باش الـ Admin يزيد موظف جديد (Biologiste/Preleveur)
    public function store(Request $request) {
        $data = $request->validate([
            'nom_complet' => 'required|string|max:255',
            'email'       => 'required|email|unique:utilisateurs,email',
            'password'    => 'required|min:6',
            'role'        => 'required|in:admin,biologiste,preleveur',
            'laboratoire_id' => 'required|exists:laboratoires,id',
        ]);

        $user = User::create([
            'nom_complet' => $data['nom_complet'],
            'email'       => $data['email'],
            'password'    => Hash::make($data['password']),
            'role'        => $data['role'],
            'laboratoire_id' => $data['laboratoire_id'],
        ]);

        return response()->json(['message' => 'Utilisateur créé avec succès', 'user' => $user], 201);
    }

    // 3. باش تمسح موظف
    public function destroy($id) {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }

   public function updateProfile(Request $request) {
    // 1. جيب المستخدم المكونيكتي مباشرة من الـ Token
    $user = $request->user(); 

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    // 2. تحديث البيانات
    $user->update([
        'nom_complet' => $request->nom_complet,
        'email' => $request->email,
    ]);

    return response()->json([
        'message' => 'Success', 
        'user' => $user
    ], 200);
}

   public function changePassword(Request $request) {
    // 1. جيب المستخدم من التوكن
    $user = $request->user();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    // 2. ضروري تجيب هاد المتغيرات من الـ request أولاً
    $oldPassword = $request->oldPassword;
    $newPassword = $request->newPassword;

    // 3. تأكد بلي الـ inputs ماشي null
    if (!$oldPassword || !$newPassword) {
        return response()->json(['message' => 'Données incomplètes'], 422);
    }

    // 4. تأكد من المودباس القديم
    if (!Hash::check($oldPassword, $user->password)) {
        return response()->json(['message' => 'L\'ancien mot de passe est incorrect'], 400);
    }

    // 5. تحديث المودباس
    $user->password = Hash::make($newPassword);
    $user->save(); 

    return response()->json(['message' => 'Password changed successfully'], 200);
} }