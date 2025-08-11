import nodemailer from 'nodemailer';
import { borrowConfirmationTemplate } from '../mailTemplates/borrowConfirmationTemplate.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

export const sendBorrowConfirmation = async ({ name, email, title, type, dueDate }) => {
    try {
        const { subject, text } = borrowConfirmationTemplate({
            name,
            title,
            type,
            dueDate
        });

        const mailOptions = {
            from: `Médiathèque <${process.env.MAIL_USER}>`,
            to: email,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
      
    } catch (error) {
        console.error(`❌ Erreur envoi email emprunt à ${email}:`, error.message);
        throw error;
    }
};