<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request) {
        // 1. Validation بسيطة ومنطقية
        $fields = $request->validate([
            'email' => 'required|email|string', 
            'password' => 'required|string'
        ]);

        // 2. تقلب على المستخدم بالإيميل
        $user = User::where('email', $fields['email'])->first();

        // 3. التحقق من المودباس
        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        // 4. Token بـ Sanctum (اللي هو Standard فـ Laravel)
        $token = $user->createToken('limstoken')->plainTextToken;

        // 5. Response كيرجع كولشي باش نحتاجوه فـ React
        return response()->json([
            'user' => $user,
            'token' => $token,
            'role' => $user->role // هادي هي الساروت باش نفرقو بين Admin و Biologiste
        ], 200);
    }

    public function logout(Request $request) {
        // كنمسحو التوكن الحالي باش يخرج
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Déconnecté avec succès'
        ]);
    }
}