import Borrow from '../models/Borrow.js';
import Media from '../models/Media.js';

// Emprunter un média
export const borrowMedia = async (req, res) => {
    try {
        const { user, media } = req.body;

        // Vérifier si le média est disponible
        const mediaItem = await Media.findById(media);
        if (!mediaItem) {
            return res.status(404).json({ message: 'Media not found' });
        }
        if (!mediaItem.available) {
            return res.status(400).json({ message: 'Media is already borrowed' });
        }

        // Créer un emprunt
        const borrow = new Borrow({ user, media });
        await borrow.save();

        // Marquer le média comme non disponible
        mediaItem.available = false;
        await mediaItem.save();

        res.status(201).json(borrow);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Retourner un média
export const returnMedia = async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id);
        if (!borrow) {
            return res.status(404).json({ message: 'Borrow record not found' });
        }
        if (borrow.status === 'returned') {
            return res.status(400).json({ message: 'Media already returned' });
        }

        // Marquer comme retourné
        borrow.status = 'returned';
        borrow.returnDate = new Date();
        await borrow.save();

        // Remettre le média en disponible
        const mediaItem = await Media.findById(borrow.media);
        if (mediaItem) {
            mediaItem.available = true;
            await mediaItem.save();
        }

        res.status(200).json({ message: 'Media returned successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Voir les emprunts d'un utilisateur
export const getUserBorrows = async (req, res) => {
    try {
        const borrows = await Borrow.find({ user: req.params.userId }).populate('media');
        res.status(200).json(borrows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Voir tous les emprunts (admin)
export const getAllBorrows = async (req, res) => {
    try {
        const borrows = await Borrow.find().populate('user').populate('media');
        res.status(200).json(borrows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};