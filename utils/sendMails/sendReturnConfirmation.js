import nodemailer from 'nodemailer';
import { returnConfirmationTemplate } from '../mailTemplates/returnConfirmationTemplate.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

export const sendReturnConfirmation = async ({ name, email, title, type }) => {
    try {
        const { subject, text } = returnConfirmationTemplate({
            name,
            title,
            type
        });

        const mailOptions = {
            from: `Médiathèque <${process.env.MAIL_USER}>`,
            to: email,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
      
    } catch (error) {
        console.error(`❌ Erreur envoi email retour à ${email}:`, error.message);
        throw error;
    }
};