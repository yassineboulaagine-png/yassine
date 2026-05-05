<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // <--- Darouriya bach Lovable i-hdr m3a Laravel

class User extends Authenticatable
{
    /**
     * HasApiTokens: bach n-creeryo l-Token (S-sarout) dyal Sanctum
     * HasFactory: bach l-Seeders i-khdmou
     * Notifiable: bach n-sifto l-notifications
     */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Smiyet l-table kima dertiha f l-migration (utilisateurs)
     */
    protected $table = 'utilisateurs'; 

    /**
     * L-columns li qablin l-remplissage (Mass Assignment)
     */
    protected $fillable = [
        'nom_complet',
        'email',
        'password',
        'role', // admin, biologiste, preleveur
        'laboratoire_id',
        'avatar',
    ];

    /**
     * L-columns li khashom i-kounou m-khbeeyin (Hidden)
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * L-casts dyal l-attributes
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed', // Laravel ghadi i-hashi l-password bo7do
        ];
    }

    /**
     * ---------------------------------------------------------
     * Les Relations (ORM)
     * ---------------------------------------------------------
     */

    // User kiy-ntami l-Laboratoire wahed 
    public function laboratoire()
    {
        return $this->belongsTo(Laboratoire::class);
    }

    // User (Preleveur) houwa li kiy-creery l-examens 
    public function examens()
    {
        return $this->hasMany(Examen::class, 'utilisateur_id');
    }

    /**
     * ---------------------------------------------------------
     * Les Fonctions dyal l-Roles (Bach n-testiw f React)
     * ---------------------------------------------------------
     */

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isBiologiste()
    {
        return $this->role === 'biologiste';
    }

    public function isPreleveur()
    {
        return $this->role === 'preleveur';
    }
}