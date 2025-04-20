import slugify from 'slugify';
import Tag from '../models/Tag.js';

// Créer un tag
export const createTag = async (req, res) => {
  try {
    const tag = new Tag(req.body);
    const saved = await tag.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obtenir tous les tags
export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort('name');
    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Modifier un tag
export const updateTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag non trouvé' });
    }

    tag.name = name;
    tag.slug = slugify(name, { lower: true, strict: true });

    const updated = await tag.save();

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer un tag
export const deleteTag = async (req, res) => {
  try {
    const deleted = await Tag.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Tag non trouvé' });
    res.status(200).json({ message: 'Tag supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};