import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';

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

// Connexion à la base de données (uniquement en production/dev)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

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

// Ajouter les routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);

// Initialisation de Swagger
swaggerDocs(app);

// Planification des rappels d'emprunts (uniquement en production/dev)
if (process.env.NODE_ENV !== 'test') {
  scheduleBorrowReminders();
}

// Route de test pour vérifier que l'API tourne
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Démarrage du serveur uniquement si ce n'est pas un test Jest
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
}

export { app, server }; // Exportation pour les tests
