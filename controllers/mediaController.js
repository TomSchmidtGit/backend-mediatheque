import Media from '../models/Media.js';
import Borrow from '../models/Borrow.js';

// Ajouter un média avec upload d'image
export const createMedia = async (req, res) => {
    try {
        console.log("📝 Données reçues :", req.body);
        console.log("📸 Fichier reçu :", req.file ? req.file.path : "Aucune image reçue");

        const { title, type, author, year, description, category, tags } = req.body;

        if (!title || !type || !author || !year || !req.file) {
            return res.status(400).json({ message: "Tous les champs obligatoires doivent être fournis, y compris l'image" });
        }

        const imageUrl = req.file.path;

        const media = new Media({
            title,
            type,
            author,
            year: parseInt(year, 10),
            description,
            imageUrl,
            category: category || null,
            tags: Array.isArray(tags) ? tags : []
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
      const { category, tags, type, search, available } = req.query;
  
      const query = {};
  
      if (type) {
        query.type = type;
      }
  
      if (category) {
        query.category = category;
      }
  
      if (tags) {
        const tagList = Array.isArray(tags)
          ? tags
          : tags.split(',').map(tag => tag.trim());
        query.tags = { $all: tagList };
      }
  
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } }
        ];
      }
  
      // Filtre par disponibilité
      if (available !== undefined) {
        query.available = available === 'true';
      }
  
      const mediaList = await Media.find(query)
        .select('title type year author imageUrl averageRating category tags available')
        .skip(skip)
        .limit(limit)
        .lean();
  
      const total = await Media.countDocuments(query);
  
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
        const updateData = {
            ...req.body,
            category: req.body.category || null,
            tags: Array.isArray(req.body.tags) ? req.body.tags : []
        };

        // Gérer l'upload d'image
        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        // Gérer la suppression d'image (si imageUrl est explicitement défini comme null ou vide)
        if (req.body.imageUrl === null || req.body.imageUrl === '') {
            updateData.imageUrl = null;
        }

        const updatedMedia = await Media.findByIdAndUpdate(req.params.id, updateData, { new: true });

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
        const mediaId = req.params.id;
        
        // Vérifier si le média existe
        const media = await Media.findById(mediaId);
        if (!media) {
            return res.status(404).json({ message: 'Média non trouvé' });
        }

        // Vérifier s'il y a des emprunts actifs (non retournés) pour ce média
        const activeBorrows = await Borrow.find({ 
            media: mediaId, 
            status: { $ne: 'returned' } 
        });

        if (activeBorrows.length > 0) {
            return res.status(400).json({ 
                message: `Impossible de supprimer ce média car il a ${activeBorrows.length} emprunt(s) actif(s). Veuillez d'abord traiter ces emprunts.`,
                activeBorrowsCount: activeBorrows.length
            });
        }

        // Supprimer tous les emprunts liés à ce média (même ceux retournés)
        const deletedBorrows = await Borrow.deleteMany({ media: mediaId });
        console.log(`🗑️ ${deletedBorrows.deletedCount} emprunt(s) supprimé(s) pour le média ${mediaId}`);

        // Supprimer le média
        const deletedMedia = await Media.findByIdAndDelete(mediaId);
        
        res.status(200).json({ 
            message: 'Média supprimé avec succès',
            deletedMedia: deletedMedia,
            deletedBorrowsCount: deletedBorrows.deletedCount
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du média:', error);
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