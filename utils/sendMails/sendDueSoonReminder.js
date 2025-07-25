import transporter from '../../config/nodemailer.js';
import { dueSoonReminderTemplate } from '../mailTemplates/dueSoonReminderTemplate.js';

export const sendDueSoonReminder = async ({ user, media, dueDate }) => {
    const { subject, text } = dueSoonReminderTemplate({
        name: user.name,
        title: media.title,
        type: media.type,
        dueDate
    });

    const mailOptions = {
        from: `Médiathèque <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
};