<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom', 
        'prenom', 
        'date_naissance', 
        'sexe', 
        'telephone',
        'cin'
    ];

    /**
     * Relation: Patient wahed tqder t-koun 3ndo bzaf d l-examens (Dossiers)
     */
    public function examens()
    {
        return $this->hasMany(Examen::class);
    }
}