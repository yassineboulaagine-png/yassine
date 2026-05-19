<!DOCTYPE html>
<html>
<head>
    <title>Statut de votre Rendez-vous</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #1e3a8a;">Bonjour {{ $rendezVous->nom }} {{ $rendezVous->prenom }},</h2>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.5;">
            Nous vous informons que le statut de votre rendez-vous prévu le <strong>{{ $rendezVous->date_rendez_vous }}</strong> a été mis à jour.
        </p>

        <div style="padding: 15px; margin: 20px 0; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold;
            background-color: {{ $rendezVous->statut === 'valide' ? '#d1fae5' : '#fee2e2' }};
            color: {{ $rendezVous->statut === 'valide' ? '#065f46' : '#991b1b' }};">
            Statut : {{ $rendezVous->statut === 'valide' ? 'Validé (Heure fixée)' : 'Annulé' }}
        </div>

        @if($rendezVous->statut === 'valide')
            <p style="font-size: 15px; color: #4b5563;">
                ⏰ <strong>Heure du rendez-vous :</strong> {{ $rendezVous->heure_rendez_vous ?? 'Veuillez vous présenter le matin' }}
            </p>
        @endif
       

        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">Merci pour votre confiance,<br>L'équipe Helix Lab</p>
    </div>
</body>
</html>