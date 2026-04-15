<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Medecin extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'prenom',
        'specialite',
        'telephone',
        'adresse'
    ];

    /**
     * Relation: Medecin wahed kiy-prescrivi (kiy-sifet) bzaf d l-examens
     */
    public function examens()
    {
        // Hna khass t-koun Examen::class machi Analyse
        return $this->hasMany(Examen::class);
    }
}