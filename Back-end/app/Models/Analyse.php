<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Analyse extends Model
{
    use HasFactory;

    /**
     * L-columns li derti f l-migration (designation, prix, norme...)
     */
    protected $fillable = [
        'designation', 
        'prix_unitaire', 
        'unite_mesure', 
        'norme_min', 
        'norme_max', 
        'type_analyse_id'
    ];

    /**
     * Relation: Analyse kat-ntami l-Type wahed (Biochimie, etc.)
     */
    public function typeAnalyse()
    {
        return $this->belongsTo(TypeAnalyse::class, 'type_analyse_id');
    }

    /**
     * Relation: Analyse tqder t-koun f bzaf d l-examens (Lignes)
     */
    public function lignes()
    {
        return $this->hasMany(LigneExamen::class);
    }
}