<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'reference' => $this->reference,
            'analyse_type' => $this->type_analyse?->libelle ?? 'N/A',
            'date' => $this->date_examen ? \Carbon\Carbon::parse($this->date_examen)->format('d/m/Y') : 'N/A',
            'statut' => $this->statut,
        ];
    }
}
