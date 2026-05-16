<!DOCTYPE html>
<html>
<head>
    <title>Validation de votre rendez-vous</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="background-color: #fff; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
        <h2>Bonjour,</h2>
        <p>Pour valider votre demande de rendez-vous, voici votre code de vérification :</p>
        <div style="background-color: #e0f2fe; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #0284c7; letter-spacing: 4px;">{{ $code }}</span>
        </div>
        <p style="color: #999; font-size: 12px;">Ce code est valable pendant 10 minutes.</p>
    </div>
</body>
</html>