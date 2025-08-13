import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Charger les variables d'environnement
dotenv.config();

// Importer les modèles
import User from '../models/User.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import Media from '../models/Media.js';

// Configuration de connexion
const MONGO_URI = process.env.MONGO_URI_PROD || process.env.MONGO_URI;

// Données de production à ajouter
const productionData = {
  categories: [
    {
      name: 'Informatique',
      description: 'Livres sur la programmation et les technologies',
      color: '#06B6D4'
    },
    {
      name: 'Cuisine',
      description: 'Livres de recettes et gastronomie',
      color: '#F97316'
    },
    {
      name: 'Voyage',
      description: 'Guides de voyage et récits de voyage',
      color: '#059669'
    }
  ],
  
  tags: [
    { name: 'Technologie', description: 'Livres sur les nouvelles technologies' },
    { name: 'Santé', description: 'Livres sur la santé et le bien-être' },
    { name: 'Écologie', description: 'Livres sur l\'environnement' },
    { name: 'Psychologie', description: 'Livres sur la psychologie humaine' }
  ],
  
  media: [
    {
      title: 'Clean Code',
      type: 'book',
      author: 'Robert C. Martin',
      year: 2008,
      description: 'Un guide pour écrire du code propre et maintenable.',
      category: 'Informatique',
      tags: ['Technologie'],
      isbn: '9780132350884',
      pages: 464,
      language: 'Anglais',
      available: true
    },
    {
      title: 'Le Grand Livre de la Cuisine Française',
      type: 'book',
      author: 'Collectif',
      year: 2020,
      description: 'Recettes traditionnelles de la cuisine française.',
      category: 'Cuisine',
      tags: ['Coup de cœur'],
      isbn: '9782017861235',
      pages: 320,
      language: 'Français',
      available: true
    },
    {
      title: 'L\'Art du Voyage',
      type: 'book',
      author: 'Alain de Botton',
      year: 2002,
      description: 'Une réflexion philosophique sur le voyage.',
      category: 'Voyage',
      tags: ['Philosophie'],
      isbn: '9782070423170',
      pages: 256,
      language: 'Français',
      available: true
    }
  ]
};

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
}

async function checkExistingData() {
  try {
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const tagCount = await Tag.countDocuments();
    const mediaCount = await Media.countDocuments();
    
    console.log('📊 Données existantes dans la base:');
    console.log(`👥 Utilisateurs: ${userCount}`);
    console.log(`📚 Catégories: ${categoryCount}`);
    console.log(`🏷️ Tags: ${tagCount}`);
    console.log(`📖 Médias: ${mediaCount}`);
    
    return { userCount, categoryCount, tagCount, mediaCount };
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  }
}

async function addCategories() {
  try {
    const categories = [];
    
    for (const categoryData of productionData.categories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      
      if (existingCategory) {
        console.log(`⚠️ Catégorie déjà existante: ${categoryData.name}`);
        categories.push(existingCategory);
      } else {
        const category = new Category(categoryData);
        await category.save();
        categories.push(category);
        console.log(`📚 Catégorie ajoutée: ${category.name}`);
      }
    }
    
    return categories;
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des catégories:', error);
    throw error;
  }
}

async function addTags() {
  try {
    const tags = [];
    
    for (const tagData of productionData.tags) {
      const existingTag = await Tag.findOne({ name: tagData.name });
      
      if (existingTag) {
        console.log(`⚠️ Tag déjà existant: ${tagData.name}`);
        tags.push(existingTag);
      } else {
        const tag = new Tag(tagData);
        await tag.save();
        tags.push(tag);
        console.log(`🏷️ Tag ajouté: ${tag.name}`);
      }
    }
    
    return tags;
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des tags:', error);
    throw error;
  }
}

async function addMedia(categories, tags) {
  try {
    const media = [];
    
    for (const mediaData of productionData.media) {
      const existingMedia = await Media.findOne({ title: mediaData.title, author: mediaData.author });
      
      if (existingMedia) {
        console.log(`⚠️ Média déjà existant: ${mediaData.title}`);
        media.push(existingMedia);
        continue;
      }
      
      const category = categories.find(cat => cat.name === mediaData.category);
      if (!category) {
        console.warn(`⚠️ Catégorie non trouvée: ${mediaData.category}`);
        continue;
      }
      
      const mediaTags = tags.filter(tag => mediaData.tags.includes(tag.name));
      
      const mediaItem = new Media({
        ...mediaData,
        category: category._id,
        tags: mediaTags.map(tag => tag._id)
      });
      
      await mediaItem.save();
      media.push(mediaItem);
      console.log(`📖 Média ajouté: ${mediaItem.title}`);
    }
    
    return media;
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des médias:', error);
    throw error;
  }
}

async function addProductionData() {
  try {
    console.log('🚀 Ajout de données de production à la base existante...\n');
    
    const dbName = MONGO_URI.split('/').pop().split('?')[0];
    console.log(`🗄️ Base de données: ${dbName}`);
    console.log(`🔗 Environnement: ${process.env.NODE_ENV || 'production'}`);

    await connectDB();
    
    const existingData = await checkExistingData();
    
    console.log('\n📝 Ajout des nouvelles données...\n');
    
    const categories = await addCategories();
    const tags = await addTags();
    const media = await addMedia(categories, tags);
    

    console.log('\n📊 Résumé de l\'ajout:');
    console.log(`📚 Nouvelles catégories: ${categories.filter(c => !existingData.categoryCount).length}`);
    console.log(`🏷️ Nouveaux tags: ${tags.filter(t => !existingData.tagCount).length}`);
    console.log(`📖 Nouveaux médias: ${media.filter(m => !existingData.mediaCount).length}`);
    
    console.log('\n✅ Ajout de données terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

addProductionData();
