import nodemailer from 'nodemailer';
import { borrowConfirmationTemplate } from '../mailTemplates/borrowConfirmationTemplate.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendBorrowConfirmation = async (user, media, dueDate) => {
    const { subject, text } = borrowConfirmationTemplate({
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