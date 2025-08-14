import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import {
  handleMongoErrors,
  handleGenericErrors,
} from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

import { scheduleBorrowReminders } from './utils/borrowReminder.js';

import swaggerDocs from './config/swaggerConfig.js';

// Charger les variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS pour la production
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? [
          'https://frontend-mediatheque.vercel.app',
          'https://frontend-mediatheque-git-main.vercel.app', // Domaine de preview
          'https://frontend-mediatheque-git-dev.vercel.app', // Domaine de développement
        ]
      : true, // En développement, autoriser tout
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));

// Protection contre le brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});
if (process.env.NODE_ENV !== 'test') {
  app.use(limiter);
}

// Middleware de vérification de la connexion à la base de données
const checkDBConnection = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    console.error(
      "❌ Tentative d'accès à la base de données sans connexion établie"
    );
    res.status(503).json({
      error:
        'Service temporairement indisponible - Base de données non connectée',
      retryAfter: 30,
    });
  }
};

// Ajouter les routes avec vérification de la connexion DB
app.use('/api/auth', checkDBConnection, authRoutes);
app.use('/api/media', checkDBConnection, mediaRoutes);
app.use('/api/borrow', checkDBConnection, borrowRoutes);
app.use('/api/users', checkDBConnection, userRoutes);
app.use('/api/categories', checkDBConnection, categoryRoutes);
app.use('/api/tags', checkDBConnection, tagRoutes);
app.use('/api/dashboard', checkDBConnection, dashboardRoutes);
app.use('/api/contact', contactRoutes);

// Initialisation de Swagger
swaggerDocs(app);

// Route de test pour vérifier que l'API tourne
app.get('/api/health', (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
      message: 'API is running',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Erreur dans /api/health:', error);
    res.status(200).json({
      message: 'API is running',
      database: 'unknown',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  }
});

// Endpoint de santé simple pour Railway (health check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion globale des erreurs
app.use(handleMongoErrors);
app.use(handleGenericErrors);

// Fonction de démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à la base de données (uniquement en production/dev)
    if (process.env.NODE_ENV !== 'test') {
      await connectDB();
      console.log('✅ Base de données connectée avec succès');

      // Planification des rappels d'emprunts
      scheduleBorrowReminders();
    }

    // Démarrage du serveur uniquement si ce n'est pas un test Jest
    let server;
    if (process.env.NODE_ENV !== 'test') {
      server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    }

    return { app, server };
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrage automatique du serveur (sauf en mode test)
if (process.env.NODE_ENV !== 'test') {
  startServer()
    .then(({ app, server }) => {
      console.log('✅ Application démarrée avec succès');
    })
    .catch(error => {
      console.error('❌ Échec du démarrage du serveur:', error);
      process.exit(1);
    });
}

export { app, startServer }; // Exportation pour les tests
