<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Laboratoire extends Model
{
    use HasFactory;

    /**
     * L-columns li tqder t-3emmerhom deqqa wehda (Mass Assignment)
     */
    protected $fillable = [
        'nom',
        'logo',
        'docteur_responsable',
        'adresse',
        'ice_if_rc'
    ];

    /**
     * Relation: Labo wahed 3ndo bzaf d l-khddama (Utilisateurs)
     */
    public function utilisateurs()
    {
        return $this->hasMany(User::class, 'laboratoire_id');
    }
}