import transporter from '../../config/nodemailer.js';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async ({ to, subject, text }) => {
  const mailOptions = {
    from: `Médiathèque <${process.env.MAIL_USER}>`,
    to,
    subject,
    text
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;