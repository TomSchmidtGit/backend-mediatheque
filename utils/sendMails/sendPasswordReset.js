import transporter from '../../config/nodemailer.js';
import { generatePasswordResetEmail } from '../mailTemplates/passwordResetTemplate.js';
import logger from '../../config/logger.js';

export const sendPasswordResetEmail = async (user, resetLink) => {
    try {
        const { subject, html, text } = generatePasswordResetEmail(user.name, resetLink);

        const mailOptions = {
            from: `Médiathèque <${process.env.MAIL_USER}>`,
            to: user.email,
            subject,
            html,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        
        logger.info(`Email de réinitialisation de mot de passe envoyé à ${user.email}`, {
            messageId: info.messageId,
            userId: user._id
        });

        return info;
    } catch (error) {
        logger.error(`Erreur lors de l'envoi de l'email de réinitialisation à ${user.email}:`, error);
        throw error;
    }
};

export default sendPasswordResetEmail;
