import Media from '../models/Media.js';

// Ajouter un média avec upload d'image
export const createMedia = async (req, res) => {
    try {
        console.log("📝 Données reçues :", req.body);
        console.log("📸 Fichier reçu :", req.file ? req.file.path : "Aucune image reçue");

        const { title, type, author, year, description } = req.body;

        if (!title || !type || !author || !year || !req.file) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires, y compris l'image" });
        }

        const imageUrl = req.file.path;

        const media = new Media({
            title,
            type,
            author,
            year: parseInt(year, 10),
            description,
            imageUrl
        });

        const savedMedia = await media.save();
        res.status(201).json(savedMedia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer tous les médias
export const getAllMedia = async (req, res) => {
    try {
        const { page, limit, skip } = req.pagination;

        const mediaList = await Media.find()
            .select('title type year author imageUrl averageRating') // Limite les champs
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Media.countDocuments();

        res.status(200).json({
            data: mediaList,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer un média par ID
export const getMediaById = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id).lean();
        if (!media) {
            return res.status(404).json({ message: 'Média non trouvé' });
        }
        res.status(200).json(media);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Modifier un média
export const updateMedia = async (req, res) => {
    try {
        const updatedMedia = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMedia) {
            return res.status(404).json({ message: 'Média non trouvé' });
        }
        res.status(200).json(updatedMedia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer un média
export const deleteMedia = async (req, res) => {
    try {
        const media = await Media.findByIdAndDelete(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Média non trouvé' });
        }
        res.status(200).json({ message: 'Média supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Ajouter un avis
export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({ message: 'Média non trouvé' });
        }

        const existingReview = media.reviews.find(r => r.user.toString() === req.user._id.toString());

        if (existingReview) {
            return res.status(400).json({ message: 'Vous avez déjà noté ce média' });
        }

        const review = { user: req.user._id, rating, comment };
        media.reviews.push(review);
        await media.updateAverageRating();

        res.status(201).json(media);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Modifier un avis
export const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({ message: 'Média non trouvé' });
        }

        const review = media.reviews.find(r => r.user.toString() === req.user._id.toString());

        if (!review) {
            return res.status(404).json({ message: "Vous n'avez pas encore noté ce média" });
        }

        review.rating = rating;
        review.comment = comment;
        await media.updateAverageRating();

        res.status(200).json(media);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};