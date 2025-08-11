// controllers/contactController.js
import { sendContactNotification } from '../utils/sendMails/sendContactNotification.js';
import { sendContactConfirmation } from '../utils/sendMails/sendContactConfirmation.js';

export const sendContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message, phone } = req.body;

        // Validation des champs obligatoires
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                message: 'Tous les champs obligatoires doivent être remplis (nom, email, sujet, message)' 
            });
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Format d\'email invalide' 
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
                minute: '2-digit'
            })
        };

        // Envoyer l'email de notification à la médiathèque
        await sendContactNotification(contactData);

        // Envoyer l'email de confirmation au client
        await sendContactConfirmation(contactData);

        // ID unique pour le tracking
        const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        res.status(200).json({
            message: 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
            contactId
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi du message de contact:', error);
        
        // Si c'est une erreur d'email, renvoyer un message spécifique
        if (error.message.includes('email') || error.code === 'EAUTH') {
            return res.status(500).json({
                message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard ou nous contacter directement.'
            });
        }

        res.status(500).json({
            message: 'Une erreur interne s\'est produite. Veuillez réessayer plus tard.'
        });
    }
};