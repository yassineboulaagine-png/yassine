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
        'cin',
        'email',
        'user_id'
    ];

    /**
     * Relation: Patient wahed tqder t-koun 3ndo bzaf d l-examens (Dossiers)
     */
    public function examens()
    {
        return $this->hasMany(Examen::class);
    }

    /**
     * Relation: Patient appartient à un utilisateur (Préleveur)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
