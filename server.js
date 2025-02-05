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

import swaggerDocs from './config/swaggerConfig.js';

// ✅ Charger les variables d'environnement
dotenv.config();

// ✅ Connexion à la base de données
connectDB();

// ✅ Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares globaux
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// ✅ Protection contre le brute force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// ✅ Ajouter les routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/users', userRoutes);

// ✅ Route de test pour vérifier que l'API tourne
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'API is running' });
});

// ✅ Initialisation de Swagger
swaggerDocs(app);

// ✅ Gestion des erreurs 404
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// ✅ Démarrage du serveur uniquement si ce n'est pas un test Jest
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

export { app, server }; // ✅ Exportation pour les tests