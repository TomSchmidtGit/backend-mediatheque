// utils/mailTemplates/contactConfirmationTemplate.js
export const contactConfirmationTemplate = ({
  name,
  subject,
  message,
  timestamp,
}) => ({
  subject: '✅ Confirmation de réception de votre message',
  text: `Bonjour ${name},

Nous avons bien reçu votre message et vous en remercions.

=== RÉCAPITULATIF DE VOTRE MESSAGE ===
Sujet : ${subject}
Date d'envoi : ${timestamp}

Message :
${message}

=== SUITE À DONNER ===
Notre équipe va examiner votre demande et vous répondra dans les plus brefs délais, généralement sous 48 heures ouvrables.

Si votre demande est urgente, n'hésitez pas à nous contacter directement par téléphone.

Cordialement,
L'équipe de la Médiathèque

---
Ceci est un message automatique, merci de ne pas y répondre.`,

  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #27ae60; color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .message-recap { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #27ae60; }
        .next-steps { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px; }
        .checkmark { font-size: 48px; color: #27ae60; text-align: center; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="checkmark">✅</div>
            <h2>Message bien reçu !</h2>
            <p>Merci pour votre message, ${name}</p>
        </div>

        <div class="content">
            <p>Nous avons bien reçu votre message et vous en remercions.</p>

            <div class="message-recap">
                <h3>📋 Récapitulatif de votre message</h3>
                <p><strong>Sujet :</strong> ${subject}</p>
                <p><strong>Date d'envoi :</strong> ${timestamp}</p>
                <p><strong>Message :</strong></p>
                <p style="white-space: pre-wrap; font-style: italic; background-color: #f8f8f8; padding: 10px; border-radius: 3px;">${message}</p>
            </div>

            <div class="next-steps">
                <h3>⏭️ Suite à donner</h3>
                <p>Notre équipe va examiner votre demande et vous répondra dans les <strong>plus brefs délais</strong>, généralement sous <strong>48 heures ouvrables</strong>.</p>
                <p>Si votre demande est urgente, n'hésitez pas à nous contacter directement par téléphone.</p>
            </div>

            <p style="text-align: center; margin-top: 30px;">
                <strong>Cordialement,<br>
                L'équipe de la Médiathèque</strong>
            </p>
        </div>

        <div class="footer">
            <p><em>Ceci est un message automatique, merci de ne pas y répondre directement à cette adresse.</em></p>
        </div>
    </div>
</body>
</html>`,
});
