<!DOCTYPE html>
<html>
<head>
    <title>Vos Résultats sont disponibles - Helix Lab</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #10b981;">Bonjour {{ $examen->patient->nom }} {{ $examen->patient->prenom }},</h2>
        
        <p>Nous vous informons que les résultats de votre examen biologique (<strong>{{ $examen->typeAnalyse->libelle ?? 'Analyse' }}</strong>) effectué le {{ $examen->date_examen }} sont désormais <strong>prêts et validés</strong> par notre biologiste.</p>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-weight: bold; color: #14532d;">📊 Vos résultats sont en ligne !</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #14532d;">
                Vous pouvez vous connecter dès maintenant sur notre plateforme pour consulter ou télécharger votre rapport complet en utilisant le **code d'accès** qui vous a été envoyé précédemment par e-mail lors de la validation de votre rendez-vous.
            </p>
        </div>

        <p>Si vous avez perdu votre code ou si vous rencontrez des difficultés pour vous connecter, n'hésitez pas à contacter notre support informatique ou à vous présenter directement au laboratoire.</p>

        <p style="margin-top: 30px;">Merci pour votre confiance,<br>L'équipe Helix Lab.</p>
    </div>
</body>
</html>