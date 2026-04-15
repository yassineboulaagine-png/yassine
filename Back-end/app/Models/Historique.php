<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Historique extends Model
{
    // Ma-ghadin-7tajo factory hna hit l-Trigger houwa li kiy-3emmerha
    protected $fillable = [
        'action',      // INSERT, UPDATE, DELETE
        'table_name', 
        'row_id', 
        'description', 
        'utilisateur'  // Smiya wlla l-email d l-user li dar l-action
    ];
}