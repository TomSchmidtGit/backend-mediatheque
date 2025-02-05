import Media from '../models/Media.js';

// Ajouter un média
export const createMedia = async (req, res) => {
    try {
        const { title, type, author, year } = req.body;

        const media = new Media({
            title,
            type,
            author,
            year
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
        const mediaList = await Media.find();
        res.status(200).json(mediaList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer un média par ID
export const getMediaById = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
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
            return res.status(404).json({ message: 'Media not found' });
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
            return res.status(404).json({ message: 'Media not found' });
        }
        res.status(200).json({ message: 'Media deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};