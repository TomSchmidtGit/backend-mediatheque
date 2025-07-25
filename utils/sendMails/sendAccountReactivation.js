import nodemailer from 'nodemailer';
import { accountReactivationTemplate } from '../mailTemplates/accountReactivationTemplate.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendAccountReactivation = async (user) => {
    const { subject, text } = accountReactivationTemplate({ name: user.name });

    const mailOptions = {
        from: `Médiathèque <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
};