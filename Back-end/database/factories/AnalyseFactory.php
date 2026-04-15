<?php

namespace Database\Factories;

use App\Models\Analyse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Analyse>
 */
class AnalyseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
        'designation' => $this->faker->randomElement(['Glycémie', 'Cholestérol', 'Hémogramme', 'Urée']),
        'prix_unitaire' => $this->faker->randomFloat(2, 50, 500),
        'unite_mesure' => $this->faker->randomElement(['g/L', 'mg/dL', 'mmol/L']),
        'norme_min' => 0.70,
        'norme_max' => 1.10,
        'type_analyse_id' => 1,
        ];
    }
}


