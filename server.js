import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';

import swaggerDocs from './config/swaggerConfig.js';

// Configuration des variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à la base de données
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Ajouter les routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/borrow', borrowRoutes);

// Initialisation de Swagger
swaggerDocs(app);

// Route de test
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'API is running' });
});

// Démarrage du serveur
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

export default app;