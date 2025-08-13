// utils/sendMails/sendContactConfirmation.js
import nodemailer from 'nodemailer';
import { contactConfirmationTemplate } from '../mailTemplates/contactConfirmationTemplate.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendContactConfirmation = async contactData => {
  try {
    const { subject, text, html } = contactConfirmationTemplate(contactData);

    const mailOptions = {
      from: `"Médiathèque" <${process.env.MAIL_USER}>`,
      to: contactData.email,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(
      `❌ Erreur envoi confirmation contact à ${contactData.email}:`,
      error.message
    );
    throw error;
  }
};
