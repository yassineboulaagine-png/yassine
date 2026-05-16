<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class StatutRendezVousMail extends Mailable
{
    use Queueable, SerializesModels;

    public $rendezVous;

    public function __construct($rendezVous)
    {
        $this->rendezVous = $rendezVous;
    }

    public function build()
    {
        return $this->subject('Mise à jour de votre Rendez-vous - Helix Lab')
                    ->view('emails.statut_rendez_vous');
    }
}