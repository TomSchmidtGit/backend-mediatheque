# 🚀 Guide de Déploiement - Backend Médiathèque

Ce guide décrit le processus de déploiement de l'API backend sur Railway.

## 📋 Table des matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [⚙️ Configuration Railway](#-configuration-railway)
- [🔧 Variables d'environnement](#-variables-denvironnement)
- [📦 Processus de déploiement](#-processus-de-déploiement)
- [🏥 Health checks](#-health-checks)
- [📊 Monitoring et logs](#-monitoring-et-logs)
- [🔄 Rollback et récupération](#-rollback-et-récupération)

## 🎯 Vue d'ensemble

Le backend de la médiathèque est déployé sur Railway, une plateforme de déploiement moderne qui offre :
- **Déploiement automatique** depuis GitHub
- **Scaling automatique** selon la charge
- **Monitoring intégré** des performances
- **Gestion des variables** d'environnement
- **Health checks** automatiques

## ⚙️ Configuration Railway

### Fichier railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```



## 🔧 Variables d'environnement

### Variables obligatoires

#### Configuration de base
```env
# Environnement
NODE_ENV=production
PORT=5001

# Base de données MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mediatheque_prod
MONGO_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/mediatheque_prod

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_here
```

#### Services externes
```env
# Cloudinary (stockage d'images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# APIs externes
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
TMDB_API_KEY=your_tmdb_api_key
```

### Variables par environnement

#### Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://prod_user:prod_pass@cluster.mongodb.net/mediatheque_prod
JWT_SECRET=production_jwt_secret_key
CLOUDINARY_CLOUD_NAME=production_cloud
MAIL_USER=prod@mediatheque.com
MAIL_PASS=your_app_password
```

#### Staging
```env
NODE_ENV=staging
MONGO_URI=mongodb+srv://staging_user:staging_pass@cluster.mongodb.net/mediatheque_staging
JWT_SECRET=staging_jwt_secret_key
CLOUDINARY_CLOUD_NAME=staging_cloud
MAIL_USER=staging@mediatheque.com
MAIL_PASS=your_app_password
```

#### Développement
```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/mediatheque_dev
JWT_SECRET=dev_jwt_secret_key
CLOUDINARY_CLOUD_NAME=dev_cloud
MAIL_USER=dev@mediatheque.com
MAIL_PASS=your_app_password
```

### Configuration des variables

#### Interface Railway
1. **Accéder** au projet Railway
2. **Sélectionner** l'environnement
3. **Aller** dans l'onglet "Variables"
4. **Ajouter/Modifier** les variables
5. **Sauvegarder** les changements



## 📦 Processus de déploiement

### Déploiement automatique

#### Configuration GitHub
1. **Connecter** le repository GitHub à Railway
2. **Configurer** les branches de déploiement
3. **Définir** les variables d'environnement
4. **Activer** le déploiement automatique

#### Branches de déploiement
- **`main`** → Production automatique
- **`feature/*`** → Pas de déploiement automatique

### Déploiement manuel


#### Via interface web
1. **Aller** dans l'onglet "Deployments"
2. **Cliquer** sur "Deploy"
3. **Sélectionner** la branche
4. **Lancer** le déploiement
5. **Surveiller** le processus

### Étapes du déploiement

#### 1. Build
```bash
# Installation des dépendances
npm install

# Vérification de la syntaxe
npm run lint

# Tests (optionnel en production)
npm run test:run
```

#### 2. Préparation
```bash
# Vérification des variables
node -e "console.log('NODE_ENV:', process.env.NODE_ENV)"

# Vérification de la configuration
node -e "console.log('Port:', process.env.PORT)"
```

#### 3. Démarrage
```bash
# Démarrage de l'application
npm start

# Vérification du processus
ps aux | grep node
```

#### 4. Validation
```bash
# Test de santé
curl https://backend-mediatheque-production.railway.app/health

# Test de l'API
curl https://backend-mediatheque-production.up.railway.app/api/health
```

## 🏥 Health checks

### Endpoint de santé

#### Implémentation
```javascript
// routes/healthRoutes.js
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Vérifier la connexion MongoDB
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Vérifier les services externes
    const servicesStatus = await checkExternalServices();

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      services: {
        database: mongoStatus,
        cloudinary: servicesStatus.cloudinary,
        email: servicesStatus.email,
        externalApis: servicesStatus.externalApis
      }
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

async function checkExternalServices() {
  const results = {
    cloudinary: 'unknown',
    email: 'unknown',
    externalApis: 'unknown'
  };

  try {
    // Test Cloudinary
    const cloudinary = await import('cloudinary');
    results.cloudinary = 'healthy';
  } catch (error) {
    results.cloudinary = 'unhealthy';
  }

  try {
    // Test email
    const nodemailer = await import('nodemailer');
    results.email = 'healthy';
  } catch (error) {
    results.email = 'unhealthy';
  }

  try {
    // Test APIs externes
    const axios = await import('axios');
    results.externalApis = 'healthy';
  } catch (error) {
    results.externalApis = 'unhealthy';
  }

  return results;
}

export default router;
```

#### Configuration Railway
```json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

### Tests de santé

#### Test manuel
```bash
# Test de base
curl https://backend-mediatheque-production.railway.app/health

# Test avec jq (si installé)
curl -s https://backend-mediatheque-production.railway.app/health | jq '.'

# Test de performance
curl -w "@curl-format.txt" -o /dev/null -s https://backend-mediatheque-production.railway.app/health
```

#### Format de réponse attendu
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "cloudinary": "healthy",
    "email": "healthy",
    "externalApis": "healthy"
  }
}
```

## 📊 Monitoring et logs

### Logs Winston

#### Configuration
```javascript
// config/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// En production, ajouter les logs Railway
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
}

export default logger;
```

#### Utilisation
```javascript
// Exemples de logs
logger.info('Application démarrée', {
  port: process.env.PORT,
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

logger.error('Erreur de connexion MongoDB', {
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
});

logger.warn('Tentative de connexion échouée', {
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});
```

### Monitoring Railway

#### Métriques disponibles
- **CPU** : Utilisation du processeur
- **Mémoire** : Utilisation de la RAM
- **Réseau** : Trafic entrant/sortant
- **Disque** : Espace utilisé
- **Uptime** : Disponibilité du service

#### Alertes
```javascript
// Exemple d'alerte personnalisée
const checkSystemHealth = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
    logger.warn('Utilisation mémoire élevée', {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external
    });
  }

  if (cpuUsage.user > 1000000) { // 1 seconde CPU
    logger.warn('Utilisation CPU élevée', {
      user: cpuUsage.user,
      system: cpuUsage.system
    });
  }
};

// Vérification toutes les 5 minutes
setInterval(checkSystemHealth, 5 * 60 * 1000);
```

## 🔄 Rollback et récupération

### Stratégies de rollback

#### Rollback automatique
1. **Health check échoue** après déploiement
2. **Railway détecte** le problème
3. **Rollback automatique** vers la version précédente
4. **Notification** envoyée à l'équipe

#### Rollback manuel
```bash
# Via interface web
# Aller dans Deployments → Sélectionner version → Rollback
```

### Procédures de récupération

#### En cas de panne
1. **Identifier** la cause du problème
2. **Vérifier** les logs et métriques
3. **Décider** du rollback ou de la correction
4. **Exécuter** la solution choisie
5. **Valider** le retour à la normale

#### Exemple de procédure
```bash
# 1. Vérifier le statut via l'interface Railway

# 2. Voir les logs via l'interface Railway

# 3. Rollback si nécessaire via l'interface Railway

# 4. Vérifier la santé
curl https://backend-mediatheque-production.railway.app/health

# 5. Surveiller la stabilité via l'interface Railway
```

---
