import transporter from '../../config/nodemailer.js';
import { dueSoonReminderTemplate } from '../mailTemplates/dueSoonReminderTemplate.js';

export const sendDueSoonReminder = async ({ user, media, dueDate }) => {
    try {
        const { subject, text } = dueSoonReminderTemplate({
            name: user.name,
            title: media.title,
            type: media.type,
            dueDate
        });

        const mailOptions = {
            from: `Médiathèque <${process.env.MAIL_USER}>`,
            to: user.email,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
      
    } catch (error) {
        console.error(`❌ Erreur envoi email rappel à ${user.email}:`, error.message);
        throw error;
    }
};