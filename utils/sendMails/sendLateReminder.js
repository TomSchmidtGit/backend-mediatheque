import transporter from '../../config/nodemailer.js';
import { lateReminderTemplate } from '../mailTemplates/lateReminderTemplate.js';

export const sendLateReminder = async ({ user, media, dueDate }) => {
    try {
        const { subject, text } = lateReminderTemplate({
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
        console.error(`❌ Erreur envoi email retard à ${user.email}:`, error.message);
        throw error;
    }
};