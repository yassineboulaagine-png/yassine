<?php

namespace Database\Factories;

use App\Models\Medecin;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medecin>
 */
class MedecinFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => $this->faker->lastName(),
            'prenom' => $this->faker->firstName(),
            'specialite' => $this->faker->randomElement(['Généraliste', 'Cardiologue', 'Pédiatre', 'Gynécologue']),
            'telephone' => $this->faker->phoneNumber(),
            'adresse' => $this->faker->address(),
        ];
    }
}
