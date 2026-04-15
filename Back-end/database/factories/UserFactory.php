<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Beddelna 'name' b 'nom' o 'prenom' kima derti f l-migration
            'nom_complet' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            
            // Password par défaut houwa 'password' (hashé)
            'password' => static::$password ??= Hash::make('password'),
            
            // Zdna l-Role kima 3ndek f l-Enum
            'role' => fake()->randomElement(['admin', 'biologiste', 'preleveur']),
            
            'remember_token' => Str::random(10),
            
            // 'laboratoire_id' ghadi n-3tiwh f Seeder mlli n-creeryo l-Labo
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}