import transporter from '../../config/nodemailer.js';
import welcomeTemplate from '../mailTemplates/welcomeTemplate.js';

const sendWelcomeEmail = async (user) => {
  try {
    const { subject, text } = welcomeTemplate({ name: user.name });

    const mailOptions = {
      from: `Médiathèque <${process.env.MAIL_USER}>`,
      to: user.email,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de bienvenue envoyé à ${user.email}`);
  } catch (error) {
    console.error(`❌ Erreur envoi email bienvenue à ${user.email}:`, error.message);
    throw error;
  }
};

export default sendWelcomeEmail;