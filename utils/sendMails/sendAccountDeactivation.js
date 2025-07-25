import nodemailer from 'nodemailer';
import { accountDeactivationTemplate } from '../mailTemplates/accountDeactivationTemplate.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendAccountDeactivation = async (user) => {
    const { subject, text } = accountDeactivationTemplate({ name: user.name });

    const mailOptions = {
        from: `Médiathèque <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
};
