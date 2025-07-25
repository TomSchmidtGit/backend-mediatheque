import transporter from '../../config/nodemailer.js';
import { lateReminderTemplate } from '../mailTemplates/lateReminderTemplate.js';

export const sendLateReminder = async ({ user, media, dueDate }) => {
    const { subject, text } = lateReminderTemplate({
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