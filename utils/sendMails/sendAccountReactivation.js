import nodemailer from 'nodemailer';
import { accountReactivationTemplate } from '../mailTemplates/accountReactivationTemplate.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendAccountReactivation = async user => {
  try {
    const { subject, text } = accountReactivationTemplate({ name: user.name });

    const mailOptions = {
      from: `Médiathèque <${process.env.MAIL_USER}>`,
      to: user.email,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(
      `❌ Erreur envoi email réactivation à ${user.email}:`,
      error.message
    );
    throw error;
  }
};
