<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    private function avatarUrl(?string $avatar): ?string
    {
        if (!$avatar) {
            return null;
        }

        $storagePath = 'avatars/' . $avatar;

        if (Storage::disk('public')->exists($storagePath)) {
            return Storage::disk('public')->url($storagePath);
        }

        if (File::exists(public_path($storagePath))) {
            return asset($storagePath);
        }

        return Storage::disk('public')->url($storagePath);
    }

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

    public function updateProfile(Request $request) {
        $user = $request->user(); 

        // Validation - Accept any image file type without mime restrictions
        $fields = $request->validate([
            'nom_complet' => 'sometimes|string',
            'email'       => 'sometimes|email|unique:utilisateurs,email,'.$user->id,
            'avatar'      => 'sometimes|file|max:5120', // 5MB - accepts any file type
        ]);

        // Upload new avatar if provided
        if ($request->hasFile('avatar')) {
            try {
                $avatarDir = 'avatars';
                $disk = Storage::disk('public');

                if (!$disk->exists($avatarDir)) {
                    $disk->makeDirectory($avatarDir);
                }

                if (!$disk->exists($avatarDir)) {
                    throw new \RuntimeException('Impossible de créer le dossier de stockage des avatars.');
                }

                // Delete old avatar if exists
                if ($user->avatar) {
                    $oldStoragePath = $avatarDir . '/' . $user->avatar;

                    if ($disk->exists($oldStoragePath)) {
                        $disk->delete($oldStoragePath);
                    }

                    $oldPublicPath = public_path('avatars/' . $user->avatar);
                    if (File::exists($oldPublicPath) && File::isWritable(dirname($oldPublicPath))) {
                        File::delete($oldPublicPath);
                    }
                }

                // Generate unique filename with user ID and timestamp
                $file = $request->file('avatar');
                $extension = $file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg';
                $imageName = 'avatar_' . $user->id . '_' . time() . '.' . strtolower($extension);
                
                // Store file in Laravel public storage: storage/app/public/avatars
                $storedPath = $file->storeAs($avatarDir, $imageName, 'public');
                if (!$storedPath) {
                    throw new \RuntimeException('Impossible d\'enregistrer le fichier avatar.');
                }
                
                // Update database with new avatar filename
                $user->avatar = $imageName;
                
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Erreur lors du téléchargement de l\'avatar: ' . $e->getMessage()
                ], 500);
            }
        }

        // Update other profile information if provided
        if ($request->has('nom_complet')) {
            $user->nom_complet = $request->nom_complet;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }

        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès!',
            'user'    => $user,
            'avatar_url' => $this->avatarUrl($user->avatar),
        ], 200);
    }

    public function getProfile(Request $request) {
        $user = $request->user();
        
        return response()->json([
            'user' => $user,
            'avatar_url' => $this->avatarUrl($user->avatar),
        ], 200);
    }
}
