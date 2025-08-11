import Borrow from '../models/Borrow.js';
import Media from '../models/Media.js';
import { sendBorrowConfirmation } from '../utils/sendMails/sendBorrowConfirmation.js';
import { sendReturnConfirmation } from '../utils/sendMails/sendReturnConfirmation.js';
import User from '../models/User.js'; // Added import for User

// Emprunter un média
export const borrowMedia = async (req, res) => {
    try {
        const { userId, mediaId, dueDate } = req.body;

        // Vérifier que les IDs sont fournis
        if (!userId || !mediaId) {
            return res.status(400).json({ message: 'userId et mediaId sont requis' });
        }

        const mediaItem = await Media.findById(mediaId);
        if (!mediaItem) return res.status(404).json({ message: 'Media not found' });
        if (!mediaItem.available) return res.status(400).json({ message: 'Media is already borrowed' });

        // Récupérer les informations de l'utilisateur qui emprunte
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const borrow = new Borrow({ 
            user: userId, 
            media: mediaId,
            dueDate: dueDate ? new Date(dueDate) : undefined
        });
        await borrow.save();

        try {
            // Envoyer email de confirmation d'emprunt à l'utilisateur qui emprunte
            await sendBorrowConfirmation({
                name: user.name,
                email: user.email,
                title: mediaItem.title,
                type: mediaItem.type,
                dueDate: borrow.dueDate.toLocaleDateString()
            });
        } catch (emailError) {
            console.error('Erreur envoi email emprunt:', emailError.message);
            // Ne pas faire échouer l'emprunt si l'email ne fonctionne pas
        }

        mediaItem.available = false;
        await mediaItem.save();

        // Populate les données pour la réponse
        const populatedBorrow = await Borrow.findById(borrow._id)
            .populate('user')
            .populate('media');

        res.status(201).json(populatedBorrow);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Retourner un média
export const returnMedia = async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id).populate('user');
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
        
        try {
            // Envoyer email de confirmation de retour à l'utilisateur qui a emprunté
            await sendReturnConfirmation({
                name: borrow.user.name,
                email: borrow.user.email,
                title: mediaItem.title,
                type: mediaItem.type
            });
        } catch (emailError) {
            console.error('Erreur envoi email retour:', emailError.message);
            // Ne pas faire échouer le retour si l'email ne fonctionne pas
        }

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
        const status = req.query.status;
        const mediaType = req.query.mediaType;
        const search = req.query.search;

        // Construire les filtres de base
        const filters = { user: userId };

        // Filtre par statut
        if (status && status !== 'all') {
            if (status === 'overdue') {
                // Pour les emprunts en retard, on filtre côté serveur
                filters.status = { $ne: 'returned' };
            } else {
                filters.status = status;
            }
        }

        // Récupérer les emprunts avec populate
        let borrows = await Borrow.find(filters)
            .populate('media')
            .sort({ borrowDate: -1 });

        // Appliquer le filtre par type de média après populate
        if (mediaType) {
            borrows = borrows.filter(borrow => borrow.media && borrow.media.type === mediaType);
        }

        // Appliquer la recherche textuelle
        if (search) {
            const searchTerm = search.toLowerCase();
            borrows = borrows.filter(borrow => {
                if (borrow.media) {
                    const mediaTitle = borrow.media.title?.toLowerCase() || '';
                    const mediaAuthor = borrow.media.author?.toLowerCase() || '';
                    return mediaTitle.includes(searchTerm) || mediaAuthor.includes(searchTerm);
                }
                return false;
            });
        }

        // Appliquer le filtre pour les emprunts en retard
        if (status === 'overdue') {
            const now = new Date();
            borrows = borrows.filter(borrow => {
                const dueDate = new Date(borrow.dueDate);
                return dueDate < now && borrow.status !== 'returned';
            });
        }

        // Pagination
        const total = borrows.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedBorrows = borrows.slice(startIndex, endIndex);

        res.status(200).json({
            page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            data: paginatedBorrows
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
        const search = req.query.search;
        const status = req.query.status;
        const user = req.query.user;
        const mediaType = req.query.mediaType;

        // Construire les filtres de base
        const filters = {};

        // Filtre par statut
        if (status && status !== 'all') {
            if (status === 'overdue') {
                // Pour les emprunts en retard, on filtre côté serveur
                filters.status = { $ne: 'returned' };
            } else {
                filters.status = status;
            }
        }

        // Récupérer les emprunts avec populate
        let borrows = await Borrow.find(filters)
            .populate('user')
            .populate('media')
            .sort({ borrowDate: -1 });

        // Appliquer les filtres côté serveur après populate
        if (search || user) {
            const searchTerm = (search || user).toLowerCase();
            borrows = borrows.filter(borrow => {
                // Vérifier si l'utilisateur existe et correspond
                if (borrow.user) {
                    const userName = borrow.user.name?.toLowerCase() || '';
                    const userEmail = borrow.user.email?.toLowerCase() || '';
                    if (userName.includes(searchTerm) || userEmail.includes(searchTerm)) {
                        return true;
                    }
                }
                
                // Vérifier si le média existe et correspond
                if (borrow.media) {
                    const mediaTitle = borrow.media.title?.toLowerCase() || '';
                    const mediaAuthor = borrow.media.author?.toLowerCase() || '';
                    if (mediaTitle.includes(searchTerm) || mediaAuthor.includes(searchTerm)) {
                        return true;
                    }
                }
                
                return false;
            });
        }

        // Appliquer le filtre par type de média après populate
        if (mediaType) {
            borrows = borrows.filter(borrow => borrow.media && borrow.media.type === mediaType);
        }

        // Appliquer le filtre pour les emprunts en retard
        if (status === 'overdue') {
            const now = new Date();
            borrows = borrows.filter(borrow => {
                const dueDate = new Date(borrow.dueDate);
                return dueDate < now && borrow.status !== 'returned';
            });
        }

        // Pagination
        const total = borrows.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedBorrows = borrows.slice(startIndex, endIndex);

        res.status(200).json({
            data: paginatedBorrows,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};