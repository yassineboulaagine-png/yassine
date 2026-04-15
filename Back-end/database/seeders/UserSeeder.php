<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User; // هادي ضرورية
use Illuminate\Support\Facades\Hash; // وهادي ضرورية

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin (Yassine)
        User::create([
            'nom_complet' => 'Yassine Admin', 
            'email' => 'admin@helix.lab',
            'password' => Hash::make('password123'), // كيتشفر هنا
            'role' => 'admin',
            'laboratoire_id' => 1 
        ]);

        // 2. Biologiste (Anas)
        User::create([
            'nom_complet' => 'Dr. Anas',
            'email' => 'anas@helix.lab',
            'password' => Hash::make('password123'),
            'role' => 'biologiste',
            'laboratoire_id' => 1
        ]);

        // 3. Preleveur (Ibrahim)
        User::create([
            'nom_complet' => 'Ibrahim Preleveur',
            'email' => 'ibrahim@helix.lab',
            'password' => Hash::make('password123'),
            'role' => 'preleveur',
            'laboratoire_id' => 1
        ]);
    }
}