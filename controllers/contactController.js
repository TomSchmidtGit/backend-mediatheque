// controllers/contactController.js
import { sendContactNotification } from '../utils/sendMails/sendContactNotification.js';
import { sendContactConfirmation } from '../utils/sendMails/sendContactConfirmation.js';

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    // Validation des champs obligatoires
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message:
          'Tous les champs obligatoires doivent être remplis (nom, email, sujet, message)',
      });
    }

    // Validation de la longueur des champs
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        message: 'Le nom doit contenir entre 2 et 100 caractères',
      });
    }

    if (subject.trim().length < 5 || subject.trim().length > 200) {
      return res.status(400).json({
        message: 'Le sujet doit contenir entre 5 et 200 caractères',
      });
    }

    if (message.trim().length < 10 || message.trim().length > 2000) {
      return res.status(400).json({
        message: 'Le message doit contenir entre 10 et 2000 caractères',
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format d'email invalide",
      });
    }

    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      phone: phone?.trim() || null,
      timestamp: new Date().toLocaleString('fr-FR', {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Envoyer l'email de notification à la médiathèque
    await sendContactNotification(contactData);

    // Envoyer l'email de confirmation au client
    await sendContactConfirmation(contactData);

    // ID unique pour le tracking
    const contactId = `contact_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    res.status(200).json({
      message:
        'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
      contactId,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message de contact:", error);

    // Si c'est une erreur d'email, renvoyer un message spécifique
    if (error.message.includes('email') || error.code === 'EAUTH') {
      return res.status(500).json({
        message:
          "Erreur lors de l'envoi de l'email. Veuillez réessayer plus tard ou nous contacter directement.",
      });
    }

    res.status(500).json({
      message:
        "Une erreur interne s'est produite. Veuillez réessayer plus tard.",
    });
  }
};
