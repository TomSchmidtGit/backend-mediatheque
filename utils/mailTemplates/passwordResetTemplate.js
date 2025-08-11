export const generatePasswordResetEmail = (userName, resetLink) => {
    return {
        subject: 'Réinitialisation de votre mot de passe - Médiathèque',
        html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Réinitialisation de mot de passe</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Réinitialisation de mot de passe</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour ${userName},</p>
                        
                        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Médiathèque.</p>
                        
                        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                        
                        <div style="text-align: center;">
                            <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Attention :</strong> Ce lien expirera dans 1 heure pour des raisons de sécurité.
                        </div>
                        
                        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
                        
                        <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                        <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
                    </div>
                    <div class="footer">
                        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                        <p>© 2024 Médiathèque - Tous droits réservés</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
            Réinitialisation de votre mot de passe - Médiathèque
            
            Bonjour ${userName},
            
            Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Médiathèque.
            
            Cliquez sur le lien suivant pour créer un nouveau mot de passe :
            ${resetLink}
            
            ⚠️ Attention : Ce lien expirera dans 1 heure pour des raisons de sécurité.
            
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
            
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            
            © 2024 Médiathèque - Tous droits réservés
        `
    };
};
