<?php

namespace Database\Factories;

use App\Models\Laboratoire;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Laboratoire>
 */
class LaboratoireFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => 'Laboratoire ' . $this->faker->company(),
            'logo' => null,
            'adresse' => $this->faker->address(),
            'docteur_responsable' => 'Dr. ' . $this->faker->lastName(),
            'ice_if_rc' => $this->faker->numerify('###############')
        ];
    }
}
