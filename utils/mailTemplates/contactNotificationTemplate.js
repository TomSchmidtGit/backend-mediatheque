// utils/mailTemplates/contactNotificationTemplate.js
export const contactNotificationTemplate = ({ name, email, subject, message, phone, timestamp }) => ({
    subject: `📧 Nouveau message de contact : ${subject}`,
    text: `Nouveau message reçu via le formulaire de contact

=== INFORMATIONS DE L'EXPÉDITEUR ===
Nom : ${name}
Email : ${email}
Téléphone : ${phone || 'Non renseigné'}
Date : ${timestamp}

=== SUJET ===
${subject}

=== MESSAGE ===
${message}

=== INSTRUCTIONS ===
Vous pouvez répondre directement à cette adresse email : ${email}

---
Message généré automatiquement par le système de contact de la Médiathèque`,

    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a90e2; color: white; padding: 20px; border-radius: 5px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .info-section { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4a90e2; }
        .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
        .email-link { color: #4a90e2; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📧 Nouveau message de contact</h2>
            <p>Sujet : ${subject}</p>
        </div>
        
        <div class="content">
            <div class="info-section">
                <h3>👤 Informations de l'expéditeur</h3>
                <p><strong>Nom :</strong> ${name}</p>
                <p><strong>Email :</strong> <a href="mailto:${email}" class="email-link">${email}</a></p>
                <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
                <p><strong>Date :</strong> ${timestamp}</p>
            </div>
            
            <div class="info-section">
                <h3>💬 Message</h3>
                <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <div class="info-section">
                <h3>📨 Action recommandée</h3>
                <p>Vous pouvez répondre directement en cliquant sur l'adresse email : <a href="mailto:${email}?subject=Re: ${subject}" class="email-link">${email}</a></p>
            </div>
        </div>
        
        <div class="footer">
            <p>Message généré automatiquement par le système de contact de la Médiathèque</p>
        </div>
    </div>
</body>
</html>`
});