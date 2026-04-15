<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'message',
        'canal',       // email, whatsapp, sms
        'statut',      // envoyé, échec
        'date_envoi',
        'examen_id'
    ];

    /**
     * Relation: Notification kat-khous examen wahed
     */
    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }
}