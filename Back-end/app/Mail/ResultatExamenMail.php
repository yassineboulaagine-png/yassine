<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Examen;

class ResultatExamenMail extends Mailable
{
    use Queueable, SerializesModels;

    public $examen;

    /**
     * Create a new message instance.
     */
    public function __construct(Examen $examen)
    {
        $this->examen = $examen;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Helix Lab - Vos résultats d\'analyse sont prêts ✨',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.resultat', // 🎯 غادي يصيفط للـ View لي سميتها resultat.blade.php
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}