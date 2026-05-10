<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Examen;

class ResultatExamenMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $examen;
    public function __construct(Examen $examen)
     {
        $this->examen = $examen;
        }
    

    /**
     * Get the message envelope.
     */

    public function build()
    {
        return $this->subject('Résultats de votre examen' )
        ->view('emails.resultat');
                    
                        
    }
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Resultat Examen Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'view.name',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
