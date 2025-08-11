// utils/sendMails/sendContactNotification.js
import nodemailer from 'nodemailer';
import { contactNotificationTemplate } from '../mailTemplates/contactNotificationTemplate.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

export const sendContactNotification = async (contactData) => {
    try {
        const { subject, text, html } = contactNotificationTemplate(contactData);

        const mailOptions = {
            from: `"Système Contact Médiathèque" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_USER, // Email de la médiathèque
            replyTo: contactData.email, // Permet de répondre directement à l'expéditeur
            subject,
            text,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Notification de contact envoyée pour : ${contactData.subject}`);
    } catch (error) {
        console.error(`❌ Erreur envoi notification contact:`, error.message);
        throw error;
    }
};