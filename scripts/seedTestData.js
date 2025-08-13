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
import Borrow from '../models/Borrow.js';

// Configuration de connexion
const MONGO_URI = process.env.MONGO_URI;

// Données de test
const testData = {
  users: [
    {
      name: 'Admin Principal',
      email: 'admin@mediatheque.fr',
      password: 'admin123',
      role: 'admin',
      actif: true
    },
    {
      name: 'Bibliothécaire',
      email: 'bibliothecaire@mediatheque.fr',
      password: 'biblio123',
      role: 'admin',
      actif: true
    },
    {
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      password: 'user123',
      role: 'user',
      actif: true
    },
    {
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      password: 'user123',
      role: 'user',
      actif: true
    },
    {
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      password: 'user123',
      role: 'user',
      actif: true
    }
  ],
  
  categories: [
    {
      name: 'Romans',
      description: 'Romans de fiction, classiques et contemporains',
      color: '#3B82F6'
    },
    {
      name: 'Sciences',
      description: 'Livres scientifiques et techniques',
      color: '#10B981'
    },
    {
      name: 'Histoire',
      description: 'Ouvrages historiques et biographies',
      color: '#F59E0B'
    },
    {
      name: 'Art & Culture',
      description: 'Livres sur l\'art, la musique et la culture',
      color: '#8B5CF6'
    },
    {
      name: 'Jeunesse',
      description: 'Livres pour enfants et adolescents',
      color: '#EC4899'
    },
    {
      name: 'BD & Comics',
      description: 'Bandes dessinées et comics',
      color: '#EF4444'
    }
  ],
  
  tags: [
    { name: 'Bestseller', description: 'Livres populaires' },
    { name: 'Nouveauté', description: 'Sorties récentes' },
    { name: 'Classique', description: 'Ouvrages classiques' },
    { name: 'Prix littéraire', description: 'Livres primés' },
    { name: 'Coup de cœur', description: 'Sélection du personnel' },
    { name: 'Adaptation cinéma', description: 'Livres adaptés au cinéma' },
    { name: 'Série', description: 'Livres faisant partie d\'une série' },
    { name: 'Autobiographie', description: 'Récits de vie' }
  ],
  
  media: [
    {
      title: 'Le Petit Prince',
      type: 'book',
      author: 'Antoine de Saint-Exupéry',
      year: 1943,
      description: 'Un conte poétique et philosophique sous l\'apparence d\'un livre pour enfants.',
      category: 'Romans',
      tags: ['Classique', 'Jeunesse'],
      isbn: '9782070612758',
      pages: 96,
      language: 'Français',
      available: true
    },
    {
      title: '1984',
      type: 'book',
      author: 'George Orwell',
      year: 1949,
      description: 'Une dystopie qui dépeint une société totalitaire sous surveillance constante.',
      category: 'Romans',
      tags: ['Classique', 'Bestseller'],
      isbn: '9782070368228',
      pages: 376,
      language: 'Français',
      available: true
    },
    {
      title: 'Le Seigneur des Anneaux',
      type: 'book',
      author: 'J.R.R. Tolkien',
      year: 1954,
      description: 'Une épopée fantastique en trois volumes.',
      category: 'Romans',
      tags: ['Classique', 'Série', 'Bestseller'],
      isbn: '9782070612888',
      pages: 1216,
      language: 'Français',
      available: true
    },
    {
      title: 'Astérix et Obélix',
      type: 'book',
      author: 'René Goscinny & Albert Uderzo',
      year: 1961,
      description: 'Aventures humoristiques de deux Gaulois résistant à l\'occupation romaine.',
      category: 'BD & Comics',
      tags: ['Classique', 'Série', 'Coup de cœur'],
      isbn: '9782012101333',
      pages: 48,
      language: 'Français',
      available: true
    },
    {
      title: 'Harry Potter à l\'école des sorciers',
      type: 'book',
      author: 'J.K. Rowling',
      year: 1997,
      description: 'Premier tome de la saga Harry Potter.',
      category: 'Jeunesse',
      tags: ['Bestseller', 'Série', 'Adaptation cinéma'],
      isbn: '9782070541270',
      pages: 320,
      language: 'Français',
      available: true
    },
    {
      title: 'Le Guide du Routard - Paris',
      type: 'book',
      author: 'Collectif',
      year: 2023,
      description: 'Guide touristique complet de Paris avec adresses et conseils.',
      category: 'Art & Culture',
      tags: ['Nouveauté', 'Coup de cœur'],
      isbn: '9782017861234',
      pages: 456,
      language: 'Français',
      available: true
    },
    {
      title: 'Cosmos',
      type: 'book',
      author: 'Carl Sagan',
      year: 1980,
      description: 'Une exploration de l\'univers et de notre place dans le cosmos.',
      category: 'Sciences',
      tags: ['Classique', 'Bestseller'],
      isbn: '9782070373635',
      pages: 384,
      language: 'Français',
      available: true
    },
    {
      title: 'Les Misérables',
      type: 'book',
      author: 'Victor Hugo',
      year: 1862,
      description: 'Un roman historique et social majeur de la littérature française.',
      category: 'Romans',
      tags: ['Classique', 'Prix littéraire'],
      isbn: '9782070413119',
      pages: 1488,
      language: 'Français',
      available: true
    },
    {
      title: 'Tintin au Tibet',
      type: 'book',
      author: 'Hergé',
      year: 1960,
      description: 'Aventure de Tintin dans l\'Himalaya.',
      category: 'BD & Comics',
      tags: ['Classique', 'Série'],
      isbn: '9782203001116',
      pages: 62,
      language: 'Français',
      available: true
      },
    {
      title: 'La Peste',
      type: 'book',
      author: 'Albert Camus',
      year: 1947,
      description: 'Un roman philosophique sur la condition humaine.',
      category: 'Romans',
      tags: ['Classique', 'Prix littéraire'],
      isbn: '9782070360424',
      pages: 288,
      language: 'Français',
      available: true
    }
  ]
};

// Fonction de connexion à MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
}

// Fonction de nettoyage de la base
async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Category.deleteMany({});
    await Tag.deleteMany({});
    await Media.deleteMany({});
    await Borrow.deleteMany({});
    console.log('🧹 Base de données nettoyée');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

async function createUsers() {
  try {
    const usersToCreate = [];
    
    for (const userData of testData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      usersToCreate.push({
        ...userData,
        password: hashedPassword
      });
    }
    
    // Utiliser insertMany pour éviter complètement les hooks
    const users = await User.insertMany(usersToCreate);
    
    users.forEach(user => {
      console.log(`👤 Utilisateur créé: ${user.name} (${user.role})`);
    });
    
    return users;
  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
    throw error;
  }
}

async function createCategories() {
  try {
    const categories = [];
    
    for (const categoryData of testData.categories) {
      const category = new Category(categoryData);
      await category.save();
      categories.push(category);
      console.log(`📚 Catégorie créée: ${category.name}`);
    }
    
    return categories;
  } catch (error) {
    console.error('❌ Erreur lors de la création des catégories:', error);
    throw error;
  }
}

async function createTags() {
  try {
    const tags = [];
    
    for (const tagData of testData.tags) {
      const tag = new Tag(tagData);
      await tag.save();
      tags.push(tag);
      console.log(`🏷️ Tag créé: ${tag.name}`);
    }
    
    return tags;
  } catch (error) {
    console.error('❌ Erreur lors de la création des tags:', error);
    throw error;
  }
}

async function createMedia(categories, tags) {
  try {
    const media = [];
    
    for (const mediaData of testData.media) {
      // Trouver la catégorie
      const category = categories.find(cat => cat.name === mediaData.category);
      if (!category) {
        console.warn(`⚠️ Catégorie non trouvée: ${mediaData.category}`);
        continue;
      }
      
      // Trouver les tags
      const mediaTags = tags.filter(tag => mediaData.tags.includes(tag.name));
      
      const mediaItem = new Media({
        ...mediaData,
        category: category._id,
        tags: mediaTags.map(tag => tag._id)
      });
      
      await mediaItem.save();
      media.push(mediaItem);
      console.log(`📖 Média créé: ${mediaItem.title}`);
    }
    
    return media;
  } catch (error) {
    console.error('❌ Erreur lors de la création des médias:', error);
    throw error;
  }
}

async function createBorrows(users, media) {
  try {
    const borrows = [];
    
    // Créer quelques emprunts de test
    const borrowData = [
      {
        user: users[2]._id, // Jean Dupont
        media: media[0]._id, // Le Petit Prince
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 jours
        status: 'borrowed'
      },
      {
        user: users[3]._id, // Marie Martin
        media: media[1]._id, // 1984
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
        status: 'borrowed'
      },
      {
        user: users[4]._id, // Pierre Durand
        media: media[2]._id, // Le Seigneur des Anneaux
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Retard de 2 jours
        status: 'overdue'
      }
    ];
    
    for (const borrowItem of borrowData) {
      const borrow = new Borrow(borrowItem);
      await borrow.save();
      borrows.push(borrow);
      
      const Media = (await import('../models/Media.js')).default;
      await Media.findByIdAndUpdate(borrowItem.media, { available: false });
      
      const user = users.find(u => u._id.equals(borrowItem.user));
      const mediaItem = media.find(m => m._id.equals(borrowItem.media));
      console.log(`📚 Emprunt créé: ${user.name} → ${mediaItem.title}`);
    }
    
    return borrows;
  } catch (error) {
    console.error('❌ Erreur lors de la création des emprunts:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log('🚀 Début du seeding de la base de données...\n');
    
    const dbName = MONGO_URI.split('/').pop().split('?')[0];
    console.log(`🗄️ Base de données: ${dbName}`);
    console.log(`🔗 Environnement: ${process.env.NODE_ENV || 'development'}`);
    
    await connectDB();
    
    // Nettoyage
    await clearDatabase();
    
    // Création des données
    console.log('\n📝 Création des données...\n');
    
    const users = await createUsers();
    const categories = await createCategories();
    const tags = await createTags();
    const media = await createMedia(categories, tags);
    const borrows = await createBorrows(users, media);
    
    // Résumé
    console.log('\n📊 Résumé du seeding:');
    console.log(`👥 Utilisateurs: ${users.length}`);
    console.log(`📚 Catégories: ${categories.length}`);
    console.log(`🏷️ Tags: ${tags.length}`);
    console.log(`📖 Médias: ${media.length}`);
    console.log(`📚 Emprunts: ${borrows.length}`);
    
    console.log('\n✅ Seeding terminé avec succès !');
    console.log('\n🔑 Comptes de test:');
    console.log('Admin: admin@mediatheque.fr / admin123');
    console.log('Bibliothécaire: bibliothecaire@mediatheque.fr / biblio123');
    console.log('Utilisateur: jean.dupont@email.com / user123');
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

seedDatabase();
