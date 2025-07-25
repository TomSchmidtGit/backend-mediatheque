import nodemailer from 'nodemailer';
import { returnConfirmationTemplate } from '../mailTemplates/returnConfirmationTemplate.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendReturnConfirmation = async (user, media) => {
    const { subject, text } = returnConfirmationTemplate({
        name: user.name,
        title: media.title,
        type: media.type
    });

    await transporter.sendMail({
        from: `"Médiathèque" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject,
        text
    });
};