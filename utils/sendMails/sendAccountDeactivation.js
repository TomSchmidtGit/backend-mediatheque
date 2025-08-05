import nodemailer from 'nodemailer';
import { accountDeactivationTemplate } from '../mailTemplates/accountDeactivationTemplate.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

export const sendAccountDeactivation = async (user) => {
    try {
        const { subject, text } = accountDeactivationTemplate({ name: user.name });

        const mailOptions = {
            from: `Médiathèque <${process.env.MAIL_USER}>`,
            to: user.email,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Email de désactivation envoyé à ${user.email}`);
    } catch (error) {
        console.error(`❌ Erreur envoi email désactivation à ${user.email}:`, error.message);
        throw error;
    }
};