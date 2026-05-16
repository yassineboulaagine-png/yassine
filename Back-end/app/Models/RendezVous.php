<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RendezVous extends Model
{
    protected $table= 'rendez_vous';

    protected $fillable = [
        'nom',
        'prenom',
        'telephone',
        'email',
        'analyse_id',
        'date_rendez_vous',
        'statut',
        'heure_rendez_vous',
        'code_acces'

    ];
}
