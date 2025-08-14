# 🏛️ Backend Médiathèque

API REST complète pour la gestion d'une médiathèque, développée avec Node.js, Express et MongoDB.

## 📋 Table des matières

- [🚀 Fonctionnalités](#-fonctionnalités)
- [🛠️ Technologies utilisées](#️-technologies-utilisées)
- [📁 Structure du projet](#-structure-du-projet)
- [⚙️ Prérequis](#️-prérequis)
- [🔧 Installation](#-installation)
- [🚀 Démarrage rapide](#-démarrage-rapide)
- [🏗️ Scripts disponibles](#️-scripts-disponibles)
- [🧪 Tests](#-tests)
- [📦 Déploiement](#-déploiement)
- [🔒 Sécurité](#-sécurité)
- [🗄️ Base de données](#-base-de-données)
- [📚 API et Endpoints](#-api-et-endpoints)
- [🔧 Configuration](#-configuration)
- [📧 Services externes](#-services-externes)
- [🚀 Performance](#-performance)
- [🤝 Contribution](#-contribution)

## 🚀 Fonctionnalités

### 👥 Gestion des utilisateurs

- **Authentification JWT** : Connexion, inscription, refresh token
- **Gestion des rôles** : Utilisateur, Employé, Administrateur
- **Récupération de mot de passe** : Système sécurisé par email
- **Gestion des sessions** : Tokens révoqués à la déconnexion
- **Profils utilisateurs** : Informations personnelles et favoris

### 📚 Gestion des médias

- **Catalogue complet** : Livres, films, musique avec métadonnées
- **Recherche avancée** : Filtres par type, catégorie, tags
- **Intégration APIs externes** : Google Books, TMDB, MusicBrainz
- **Upload d'images** : Stockage Cloudinary avec optimisation
- **Gestion des catégories** : Organisation hiérarchique

### 📖 Système d'emprunt

- **Gestion des emprunts** : Création, modification, retour
- **Calcul automatique** : Dates d'échéance et retards
- **Notifications automatiques** : Rappels par email et cron jobs
- **Historique complet** : Suivi des emprunts actuels et passés
- **Statistiques** : Tableau de bord avec métriques

### 👨‍💼 Administration

- **Tableau de bord admin** : Statistiques globales et alertes
- **Gestion des utilisateurs** : CRUD complet avec validation
- **Gestion des médias** : Ajout, édition, suppression
- **Gestion des emprunts** : Vue d'ensemble et actions
- **Gestion des catégories** : Organisation du catalogue

### 🔒 Sécurité et validation

- **Validation des données** : Express-validator et Zod
- **Rate limiting** : Protection contre le brute force
- **Helmet** : Headers de sécurité HTTP
- **CORS configuré** : Gestion des origines autorisées
- **Validation des tokens** : Middleware d'authentification

## 🛠️ Technologies utilisées

### Backend

- **Node.js 18+** : Runtime JavaScript
- **Express.js** : Framework web minimaliste
- **MongoDB Atlas** : Base de données NoSQL
- **Mongoose** : ODM pour MongoDB
- **JWT** : Authentification stateless

### Sécurité et validation

- **bcryptjs** : Hashage des mots de passe
- **express-validator** : Validation des données
- **helmet** : Sécurité des headers HTTP
- **express-rate-limit** : Protection contre le spam
- **cors** : Gestion des origines croisées

### Services externes

- **Cloudinary** : Stockage et optimisation d'images
- **Nodemailer** : Envoi d'emails
- **Google Books API** : Métadonnées des livres
- **TMDB API** : Métadonnées des films
- **MusicBrainz API** : Métadonnées de la musique

### Outils de développement

- **ESLint** : Linting du code
- **Prettier** : Formatage automatique
- **Jest** : Framework de tests
- **Supertest** : Tests d'intégration
- **Pre-commit hooks** : Qualité du code

### Monitoring et logs

- **Winston** : Système de logging
- **Morgan** : Logs des requêtes HTTP
- **Health checks** : Vérification de l'état du service
- **Cron jobs** : Tâches planifiées

## 📁 Structure du projet

```
backend-mediatheque/
├── 📁 config/                 # Configuration de l'application
│   ├── auth.js               # Configuration JWT
│   ├── cloudinary.js         # Configuration Cloudinary
│   ├── db.js                 # Configuration MongoDB
│   ├── logger.js             # Configuration Winston
│   ├── multer.js             # Configuration upload
│   ├── nodemailer.js         # Configuration email
│   └── swaggerConfig.js      # Configuration Swagger
├── 📁 controllers/            # Contrôleurs métier
│   ├── authController.js     # Authentification
│   ├── borrowController.js   # Gestion des emprunts
│   ├── categoryController.js # Gestion des catégories
│   ├── contactController.js  # Formulaire de contact
│   ├── dashboardController.js # Tableau de bord admin
│   ├── externalApiController.js # APIs externes
│   ├── mediaController.js    # Gestion des médias
│   ├── tagController.js      # Gestion des tags
│   └── userController.js     # Gestion des utilisateurs
├── 📁 middlewares/            # Middlewares Express
│   ├── authMiddleware.js     # Authentification JWT
│   ├── errorHandler.js       # Gestion des erreurs
│   ├── pagination.js         # Pagination des résultats
│   ├── rateLimiters.js       # Limitation des requêtes
│   ├── tokenMiddleware.js    # Gestion des tokens
│   └── validateRequest.js    # Validation des requêtes
├── 📁 models/                 # Modèles Mongoose
│   ├── Borrow.js             # Modèle des emprunts
│   ├── Category.js           # Modèle des catégories
│   ├── Media.js              # Modèle des médias
│   ├── PasswordResetToken.js # Tokens de réinitialisation
│   ├── RefreshToken.js       # Tokens de rafraîchissement
│   ├── Tag.js                # Modèle des tags
│   └── User.js               # Modèle des utilisateurs
├── 📁 routes/                 # Routes de l'API
│   ├── authRoutes.js         # Routes d'authentification
│   ├── borrowRoutes.js       # Routes des emprunts
│   ├── categoryRoutes.js     # Routes des catégories
│   ├── contactRoutes.js      # Routes de contact
│   ├── dashboardRoutes.js    # Routes du tableau de bord
│   ├── externalApiRoutes.js  # Routes des APIs externes
│   ├── mediaRoutes.js        # Routes des médias
│   ├── tagRoutes.js          # Routes des tags
│   └── userRoutes.js         # Routes des utilisateurs
├── 📁 services/               # Services externes
│   ├── googleBooksService.js # Service Google Books
│   ├── musicBrainzService.js # Service MusicBrainz
│   └── tmdbService.js        # Service TMDB
├── 📁 utils/                  # Utilitaires
│   ├── 📁 mailTemplates/     # Templates d'emails
│   ├── 📁 sendMails/         # Services d'envoi d'emails
│   ├── borrowReminder.js     # Rappels d'emprunts
│   └── notifyDueBorrows.js   # Notifications de retard
├── 📁 tests/                  # Tests de l'application
├── 📁 logs/                   # Fichiers de logs
├── 📁 scripts/                # Scripts utilitaires
├── server.js                  # Point d'entrée principal
├── package.json               # Dépendances et scripts
├── Dockerfile                 # Configuration Docker
├── railway.json               # Configuration Railway
└── jest.config.js             # Configuration Jest
```

## ⚙️ Prérequis

- **Node.js** : Version 18+ (recommandé 20+)
- **npm** : Version 9+ ou **yarn** ou **pnpm**
- **MongoDB** : Base de données locale ou cloud (dans notre cas Cloud)
- **Git** : Pour le contrôle de version

### Vérification des prérequis

```bash
# Vérifier Node.js
node --version  # Doit être >= 18

# Vérifier npm
npm --version   # Doit être >= 9

# Vérifier MongoDB (si local)
mongod --version

# Vérifier Git
git --version
```

## 🔧 Installation

### 1. Cloner le repository

```bash
git clone <url-du-repo>
cd backend-mediatheque
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Configuration du serveur
NODE_ENV=development
PORT=5001

# Base de données MongoDB
MONGO_URI=mongodb://localhost:27017/mediatheque
MONGO_URI_PROD=mongodb+srv://user:password@cluster.mongodb.net/mediatheque

# JWT
JWT_SECRET=votre_secret_jwt_super_securise

# Cloudinary (stockage d'images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Email (Nodemailer)
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app

# APIs externes (optionnelles)
GOOGLE_BOOKS_API_KEY=votre_google_books_api_key
TMDB_API_KEY=votre_tmdb_api_key

```

### 4. Configuration des hooks pre-commit

```bash
npm run setup:pre-commit
```

### 5. Configuration de la base de données

#### MongoDB locale

```bash
# Installer MongoDB
# Sur macOS avec Homebrew
brew install mongodb-community

# Démarrer MongoDB
brew services start mongodb-community

# Ou démarrer manuellement
mongod --config /usr/local/etc/mongod.conf
```

#### MongoDB Atlas (cloud)

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un cluster
3. Obtenir l'URI de connexion
4. Ajouter l'URI dans `.env`

## 🚀 Démarrage rapide

### Mode développement

```bash
npm run dev
```

L'API sera accessible sur `http://localhost:5001`

### Mode production

```bash
npm start
```

### Tests

```bash
# Tests en mode watch
npm run test:watch

# Tests une seule fois
npm run test

# Tests avec couverture
npm run test:coverage

# Tests en mode CI
npm run test:ci
```

### Seed des données

```bash
# Données de test
npm run seed

# Données de développement
npm run seed:dev

# Données de production
npm run seed:prod
```

## 🏗️ Scripts disponibles

### Développement

```bash
npm run dev              # Démarrage avec nodemon
npm start                # Démarrage en production
npm run health-check     # Vérification de la santé du service
```

### Tests

```bash
npm run test             # Tests une seule fois
npm run test:watch       # Tests en mode watch
npm run test:coverage    # Tests avec couverture
npm run test:ci          # Tests en mode CI
npm run test:debug       # Tests en mode debug
npm run test:fix         # Tests avec détection des handles ouverts
```

### Qualité du code

```bash
npm run lint             # Vérification ESLint
npm run lint:fix         # Correction automatique ESLint
npm run format           # Formatage Prettier
npm run format:check     # Vérification du formatage
```

### CI/CD

```bash
npm run ci               # Exécution complète de la CI
npm run setup:pre-commit # Installation des hooks pre-commit
npm run pre-commit:run   # Exécution manuelle des hooks
```

### Seed des données

```bash
npm run seed             # Données de test
npm run seed:dev         # Données de développement
npm run seed:prod        # Données de production
```

## 🧪 Tests

### Structure des tests

```
tests/
├── 📁 controllers/       # Tests des contrôleurs
├── 📁 middlewares/       # Tests des middlewares
├── 📁 models/            # Tests des modèles
├── 📁 routes/            # Tests des routes
├── 📁 utils/             # Tests des utilitaires
├── setup.js              # Configuration des tests
└── utils/
    └── testHelpers.js    # Helpers pour les tests
```

### Exécution des tests

```bash
# Tests en mode watch (développement)
npm run test:watch

# Tests une seule fois (CI)
npm run test

# Tests avec couverture de code
npm run test:coverage

# Tests en mode debug
npm run test:debug
```

### Écriture de tests

```javascript
import request from 'supertest';
import { app } from '../server.js';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
  });
});
```

### Configuration Jest

```javascript
// jest.config.js
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
  ],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  maxWorkers: 1,
  bail: false,
  detectOpenHandles: true,
  forceExit: true,
};
```

## 📦 Déploiement

### Déploiement avec Docker

#### 1. Build de l'image

```bash
# Build pour la production
docker build --target production -t mediatheque-backend .

# Build pour le développement
docker build --target development -t mediatheque-backend:dev .
```

#### 2. Exécution du conteneur

```bash
# Production
docker run -p 5001:5001 mediatheque-backend

# Développement
docker run -p 5001:5001 mediatheque-backend:dev
```

### Déploiement avec Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build:
      context: ./backend-mediatheque
      target: production
    ports:
      - '5001:5001'
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/mediatheque
    depends_on:
      - mongo
    volumes:
      - ./logs:/app/logs

  mongo:
    image: mongo:6
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=mediatheque

volumes:
  mongo_data:
```

```bash
docker-compose up -d
```

### Déploiement sur Railway

Le projet est configuré pour un déploiement automatique sur Railway :

1. Connecter le repository GitHub à Railway
2. Configurer les variables d'environnement
3. Les déploiements se font automatiquement à chaque push
4. Configuration dans `railway.json`

### Déploiement manuel

```bash
# Build de production
npm run build

# Démarrer le serveur
npm start
```

## 🔒 Sécurité

### Authentification JWT

- **Access Token** : Expiration courte (15 minutes)
- **Refresh Token** : Expiration longue (7 jours)
- **Blacklist** : Tokens révoqués à la déconnexion
- **Rotation** : Renouvellement automatique des tokens

### Protection des routes

- **Middleware d'auth** : Vérification des tokens
- **Gestion des rôles** : Autorisation basée sur les permissions
- **Routes protégées** : Vérification de l'authentification
- **Middleware admin** : Accès restreint aux administrateurs

### Validation et sanitisation

- **Express-validator** : Validation des données d'entrée
- **Sanitisation** : Protection contre les injections
- **Rate limiting** : Protection contre le brute force
- **CORS configuré** : Gestion des origines autorisées

### Headers de sécurité

- **Helmet** : Configuration automatique des headers
- **X-Frame-Options** : Protection contre le clickjacking
- **X-XSS-Protection** : Protection XSS
- **Content-Security-Policy** : Politique de sécurité

## 🗄️ Base de données

### Modèles Mongoose

#### User

```javascript
{
  name: String,           // Nom de l'utilisateur
  email: String,          // Email unique
  password: String,       // Mot de passe hashé
  role: String,           // user, employee, admin
  favorites: [Media],     // Médias favoris
  actif: Boolean,         // Statut actif/inactif
  timestamps: true        // createdAt, updatedAt
}
```

#### Media

```javascript
{
  title: String,          // Titre du média
  type: String,           // book, movie, music
  author: String,         // Auteur/Artiste/Réalisateur
  year: Number,           // Année de sortie
  available: Boolean,     // Disponibilité
  description: String,    // Description
  category: Category,     // Catégorie
  tags: [Tag],           // Tags
  imageUrl: String,      // URL de l'image
  externalData: Object,  // Données des APIs externes
  timestamps: true
}
```

#### Borrow

```javascript
{
  user: User,             // Utilisateur emprunteur
  media: Media,           // Média emprunté
  borrowDate: Date,       // Date d'emprunt
  dueDate: Date,          // Date de retour prévue
  returnDate: Date,       // Date de retour effective
  status: String,         // borrowed, returned, overdue
  timestamps: true
}
```

### Indexation et performance

- **Index unique** : Email des utilisateurs
- **Index composés** : Recherche de médias
- **Index géospatial** : Si nécessaire pour la localisation
- **Optimisation des requêtes** : Agrégations MongoDB

## 📚 API et Endpoints

### Documentation Swagger

L'API est documentée avec Swagger et accessible sur `/api-docs` en développement.

### Routes principales

#### Authentification (`/api/auth`)

```http
POST   /register          # Inscription
POST   /login             # Connexion
POST   /refresh           # Rafraîchir le token
POST   /logout            # Déconnexion
POST   /forgot-password   # Demande de réinitialisation
POST   /reset-password    # Réinitialisation du mot de passe
PUT    /change-password   # Changement de mot de passe
```

#### Médias (`/api/media`)

```http
GET    /                  # Liste des médias avec filtres
GET    /:id               # Détails d'un média
POST   /                  # Créer un média (admin)
PUT    /:id               # Modifier un média (admin)
DELETE /:id               # Supprimer un média (admin)
POST   /:id/favorite      # Ajouter aux favoris
DELETE /:id/favorite      # Retirer des favoris
POST   /upload            # Upload d'image
```

#### Emprunts (`/api/borrow`)

```http
GET    /                  # Liste des emprunts
GET    /:id               # Détails d'un emprunt
POST   /                  # Créer un emprunt
PUT    /:id               # Modifier un emprunt
DELETE /:id               # Supprimer un emprunt
POST   /:id/return        # Retourner un média
GET    /user/:userId      # Emprunts d'un utilisateur
```

#### Utilisateurs (`/api/users`)

```http
GET    /                  # Liste des utilisateurs (admin)
GET    /profile           # Profil de l'utilisateur connecté
PUT    /profile           # Modifier le profil
PUT    /:id               # Modifier un utilisateur (admin)
DELETE /:id               # Supprimer un utilisateur (admin)
PUT    /:id/activate      # Activer/désactiver un utilisateur
```

#### Tableau de bord (`/api/dashboard`)

```http
GET    /stats             # Statistiques globales
GET    /alerts            # Alertes et notifications
GET    /overdue           # Emprunts en retard
GET    /recent-activity   # Activité récente
GET    /top-media         # Médias les plus populaires
```

### Gestion des erreurs

```javascript
// Format standard des erreurs
{
  "error": "Message d'erreur",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/media",
  "details": {
    "field": "validation error details"
  }
}
```

### Pagination

```javascript
// Paramètres de pagination
{
  "page": 1,              // Page actuelle
  "limit": 10,             // Éléments par page
  "totalPages": 5,         // Nombre total de pages
  "totalItems": 50,        // Nombre total d'éléments
  "hasNextPage": true,     // Page suivante disponible
  "hasPrevPage": false     // Page précédente disponible
}
```

## 🔧 Configuration

### Variables d'environnement

#### Base de données

```env
MONGO_URI=mongodb://localhost:27017/mediatheque
MONGO_URI_PROD=mongodb+srv://user:password@cluster.mongodb.net/mediatheque
```

#### JWT

```env
JWT_SECRET=votre_secret_jwt_super_securise
```

#### Services externes

```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

### Configuration MongoDB

```javascript
// config/db.js
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
};
```

### Configuration Winston (logs)

```javascript
// config/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

## 📧 Services externes

### Cloudinary (Images)

```javascript
// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

### Nodemailer (Emails)

```javascript
// config/nodemailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### APIs externes

#### Google Books

```javascript
// services/googleBooksService.js
class GoogleBooksService {
  async searchBooks(query, maxResults = 20) {
    const response = await axios.get(`${this.baseUrl}/volumes`, {
      params: { q: query, maxResults, key: this.apiKey },
    });
    return response.data.items.map(item => this.formatBookData(item));
  }
}
```

#### TMDB (Films)

```javascript
// services/tmdbService.js
class TMDBService {
  async searchMovies(query, page = 1) {
    const response = await axios.get(`${this.baseUrl}/search/movie`, {
      params: { query, page, api_key: this.apiKey },
    });
    return response.data.results.map(movie => this.formatMovieData(movie));
  }
}
```

#### MusicBrainz (Musique)

```javascript
// services/musicBrainzService.js
class MusicBrainzService {
  async searchReleases(query, limit = 20) {
    const response = await axios.get(`${this.baseUrl}/release`, {
      params: { query, limit, fmt: 'json' },
    });
    return response.data.releases.map(release =>
      this.formatReleaseData(release)
    );
  }
}
```

## 🚀 Performance

### Optimisations MongoDB

- **Indexation** : Index sur les champs de recherche fréquents
- **Projection** : Sélection des champs nécessaires uniquement
- **Agrégation** : Pipeline d'agrégation pour les statistiques
- **Pagination** : Limitation du nombre de résultats

### Cache et optimisation

- **React Query** : Cache côté client (frontend)
- **Mise en cache** : Stratégies de cache pour les données statiques
- **Compression** : Gzip des réponses HTTP
- **Optimisation des images** : Cloudinary avec transformations

### Monitoring et métriques

- **Health checks** : Vérification de l'état du service
- **Logs structurés** : Winston avec format JSON
- **Métriques de performance** : Temps de réponse, taux d'erreur
- **Alertes** : Notifications en cas de problème

### Tâches planifiées

```javascript
// utils/borrowReminder.js
import cron from 'node-cron';

export const scheduleBorrowReminders = () => {
  // Tous les jours à 9h00
  cron.schedule(
    '0 9 * * *',
    async () => {
      await checkDueBorrows();
    },
    { timezone: 'Europe/Paris' }
  );
};
```

## 🤝 Contribution

### Workflow de développement

1. **Fork** du repository
2. **Création** d'une branche feature
3. **Développement** avec tests
4. **Commit** avec messages conventionnels
5. **Push** et création d'une Pull Request
6. **Review** et merge

### Standards de code

- **ESLint** : Règles de qualité du code
- **Prettier** : Formatage automatique
- **Jest** : Tests avec couverture minimale de 80%
- **Pre-commit hooks** : Vérification automatique

### Hooks pre-commit

```bash
# Installation automatique
npm run setup:pre-commit

# Exécution manuelle
npm run pre-commit:run
```

Les hooks vérifient automatiquement :

- Qualité du code (ESLint)
- Formatage (Prettier)
- Tests
- Sécurité des dépendances

### Tests et qualité

```bash
# Vérification complète
npm run ci

# Tests avec couverture
npm run test:coverage

# Linting et formatage
npm run lint && npm run format:check
```

## 🆘 Support

### Problèmes courants

#### Erreur de connexion MongoDB

```bash
# Vérifier que MongoDB est démarré
brew services list | grep mongodb

# Vérifier la connexion
npm run health-check
```

#### Erreurs JWT

```bash
# Vérifier les variables d'environnement
echo $JWT_SECRET
echo $JWT_REFRESH_SECRET

# Régénérer les secrets si nécessaire
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Tests qui échouent

```bash
# Nettoyer et relancer
npm run test:fix
npm run test:coverage
```

### Logs et debugging

```bash
# Voir les logs en temps réel
tail -f logs/combined.log

# Voir les erreurs
tail -f logs/error.log

# Mode debug
NODE_ENV=development DEBUG=* npm run dev
```

---

**Développé par Tom Schmidt**
