import Borrow from '../models/Borrow.js';
import Media from '../models/Media.js';
import { sendBorrowConfirmation } from '../utils/sendMails/sendBorrowConfirmation.js';
import { sendReturnConfirmation } from '../utils/sendMails/sendReturnConfirmation.js';

// Emprunter un média
export const borrowMedia = async (req, res) => {
    try {
        const { user, media } = req.body;

        const mediaItem = await Media.findById(media);
        if (!mediaItem) return res.status(404).json({ message: 'Media not found' });
        if (!mediaItem.available) return res.status(400).json({ message: 'Media is already borrowed' });

        const borrow = new Borrow({ user, media });
        await borrow.save();

        // Envoyer email de confirmation d'emprunt
        await sendBorrowConfirmation({
            name: req.user.name,
            email: req.user.email,
            title: mediaItem.title,
            type: mediaItem.type,
            dueDate: borrow.dueDate.toLocaleDateString()
        });

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
        if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
        if (borrow.status === 'returned') return res.status(400).json({ message: 'Media already returned' });

        borrow.status = 'returned';
        borrow.returnDate = new Date();
        await borrow.save();

        const mediaItem = await Media.findById(borrow.media);
        if (mediaItem) {
            mediaItem.available = true;
            await mediaItem.save();
        }
        
        // Envoyer email de confirmation de retour
        await sendReturnConfirmation({
            name: req.user.name,
            email: req.user.email,
            title: mediaItem.title,
            type: mediaItem.type
        });

        res.status(200).json({ message: 'Media returned successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Voir les emprunts d'un utilisateur spécifique (admin ou l'utilisateur lui-même)
export const getUserBorrows = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès interdit' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const borrows = await Borrow.find({ user: userId })
            .populate('media')
            .sort({ borrowDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Borrow.countDocuments({ user: userId });

        res.status(200).json({
            page,
            totalPages: Math.ceil(total / limit),
            totalBorrows: total,
            data: borrows
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des emprunts' });
    }
};

// Voir ses propres emprunts (route spécifique à l'utilisateur connecté)
export const getMyBorrows = async (req, res) => {
    try {
        const userId = req.user._id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const borrows = await Borrow.find({ user: userId })
            .populate('media')
            .sort({ borrowDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Borrow.countDocuments({ user: userId });

        res.status(200).json({
            page,
            totalPages: Math.ceil(total / limit),
            totalBorrows: total,
            data: borrows
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de vos emprunts' });
    }
};

// Voir tous les emprunts (admin uniquement)
export const getAllBorrows = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const borrows = await Borrow.find()
            .populate('user')
            .populate('media')
            .sort({ borrowDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Borrow.countDocuments();

        res.status(200).json({
            page,
            totalPages: Math.ceil(total / limit),
            totalBorrows: total,
            data: borrows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};