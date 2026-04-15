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
}