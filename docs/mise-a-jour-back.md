# 🔄 Guide de Mise à Jour - Backend Médiathèque

Ce guide décrit les procédures et règles de mise à jour de l'API backend.

## 📋 Table des matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [📦 Gestion des dépendances](#-gestion-des-dépendances)
- [🗄️ Migrations de base de données](#-migrations-de-base-de-données)
- [🔐 Rotation des secrets](#-rotation-des-secrets)
- [🔄 Compatibilité API](#-compatibilité-api)
- [🧪 Tests et validation](#-tests-et-validation)
- [📚 Documentation](#-documentation)

## 🎯 Vue d'ensemble

Les mises à jour du backend suivent un processus structuré pour garantir la stabilité de l'API et la cohérence des données. Ce guide couvre tous les aspects des mises à jour, des dépendances aux migrations de base de données.

## 📦 Gestion des dépendances

### Politique de mise à jour

#### Dépendances critiques
- **Node.js** : Mise à jour majeure après validation complète
- **Express** : Mise à jour mineure automatique, majeure après tests
- **Mongoose** : Mise à jour après validation des schémas
- **JWT** : Mise à jour mineure automatique

#### Dépendances de sécurité
- **bcryptjs** : Mise à jour automatique des patchs
- **helmet** : Mise à jour automatique
- **express-rate-limit** : Mise à jour automatique
- **cors** : Mise à jour automatique

#### Dépendances de développement
- **Jest** : Mise à jour après validation des tests
- **ESLint, Prettier** : Mise à jour automatique
- **Supertest** : Mise à jour après validation des tests d'intégration

### Processus de mise à jour

#### 1. Vérification des mises à jour
```bash
# Vérifier les mises à jour disponibles
npm outdated

# Vérifier les vulnérabilités
npm audit

# Vérifier les mises à jour avec npm-check-updates
npx ncu

# Vérifier les dépendances obsolètes
npm ls
```

#### 2. Mise à jour des dépendances
```bash
# Mise à jour automatique des patchs
npm update

# Mise à jour manuelle des versions mineures/majeures
npm install package@latest

# Mise à jour de toutes les dépendances
npx ncu -u && npm install

# Mise à jour des dépendances de développement
npm update --save-dev
```

#### 3. Validation post-mise à jour
```bash
# Vérifier que l'application se lance
npm run dev

# Lancer les tests
npm run test:run

# Vérifier le linting
npm run lint

# Vérifier la sécurité
npm audit
```

### Gestion des conflits

#### Résolution des conflits de versions
1. **Identifier** les conflits dans `package-lock.json`
2. **Analyser** l'impact sur les fonctionnalités
3. **Tester** la compatibilité
4. **Résoudre** en ajustant les versions

#### Exemple de résolution
```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.0.0"
  }
}
```

## 🗄️ Migrations de base de données

### Types de migrations

#### Migrations de schéma
- **Ajout de champs** : Nouveaux propriétés
- **Modification de types** : Changement de format
- **Suppression de champs** : Nettoyage des données
- **Indexation** : Optimisation des performances

#### Migrations de données
- **Transformation** : Changement de format
- **Nettoyage** : Suppression des données obsolètes
- **Enrichissement** : Ajout de données manquantes
- **Validation** : Correction des données invalides

### Implémentation des migrations

#### Script de migration
```javascript
// scripts/migrations/v1.1.0-add-user-profile.js
import mongoose from 'mongoose';
import { User } from '../../models/User.js';

export const migration_1_1_0_add_user_profile = async () => {
  try {
    console.log('Début de la migration 1.1.0: Ajout du profil utilisateur');

    // 1. Mettre à jour le schéma
    const userSchema = User.schema;
    userSchema.add({
      profile: {
        avatar: { type: String, default: null },
        bio: { type: String, maxlength: 500 },
        preferences: {
          notifications: { type: Boolean, default: true },
          theme: { type: String, enum: ['light', 'dark'], default: 'light' }
        }
      }
    });

    // 2. Mettre à jour les documents existants
    const result = await User.updateMany(
      { profile: { $exists: false } },
      {
        $set: {
          profile: {
            avatar: null,
            bio: '',
            preferences: {
              notifications: true,
              theme: 'light'
            }
          }
        }
      }
    );

    console.log(`${result.modifiedCount} utilisateurs mis à jour`);

    // 3. Valider la migration
    const users = await User.find({});
    const validUsers = users.filter(user => user.profile);

    if (validUsers.length === users.length) {
      console.log('Migration 1.1.0 réussie');
      return true;
    } else {
      throw new Error('Migration incomplète');
    }

  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    throw error;
  }
};
```

#### Script de rollback
```javascript
// scripts/migrations/v1.1.0-rollback.js
import mongoose from 'mongoose';
import { User } from '../../models/User.js';

export const rollback_1_1_0_user_profile = async () => {
  try {
    console.log('Début du rollback 1.1.0: Suppression du profil utilisateur');

    // 1. Supprimer le champ profile
    const userSchema = User.schema;
    delete userSchema.paths.profile;

    // 2. Mettre à jour les documents
    const result = await User.updateMany(
      { profile: { $exists: true } },
      { $unset: { profile: 1 } }
    );

    console.log(`${result.modifiedCount} utilisateurs mis à jour`);

    // 3. Valider le rollback
    const users = await User.find({});
    const usersWithoutProfile = users.filter(user => !user.profile);

    if (usersWithoutProfile.length === users.length) {
      console.log('Rollback 1.1.0 réussi');
      return true;
    } else {
      throw new Error('Rollback incomplet');
    }

  } catch (error) {
    console.error('Erreur lors du rollback:', error);
    throw error;
  }
};
```

### Gestion des migrations

#### Système de versioning
```javascript
// scripts/migrationManager.js
import fs from 'fs';
import path from 'path';

class MigrationManager {
  constructor() {
    this.migrationsPath = './scripts/migrations';
    this.migrations = [];
    this.loadMigrations();
  }

  loadMigrations() {
    const files = fs.readdirSync(this.migrationsPath);
    this.migrations = files
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const { name } = path.parse(file);
        return {
          name,
          file,
          executed: false
        };
      })
      .sort();
  }

  async runMigrations() {
    console.log('Début des migrations...');

    for (const migration of this.migrations) {
      try {
        const migrationModule = await import(`./migrations/${migration.file}`);
        const migrationFunction = migrationModule[`migration_${migration.name}`];

        if (migrationFunction) {
          console.log(`Exécution de la migration: ${migration.name}`);
          await migrationFunction();
          migration.executed = true;
          console.log(`Migration ${migration.name} réussie`);
        }
      } catch (error) {
        console.error(`Erreur lors de la migration ${migration.name}:`, error);
        throw error;
      }
    }

    console.log('Toutes les migrations ont été exécutées');
  }

  async rollbackMigration(version) {
    const migration = this.migrations.find(m => m.name === version);
    if (!migration) {
      throw new Error(`Migration ${version} non trouvée`);
    }

    try {
      const migrationModule = await import(`./migrations/${migration.file}`);
      const rollbackFunction = migrationModule[`rollback_${migration.name}`];

      if (rollbackFunction) {
        console.log(`Rollback de la migration: ${migration.name}`);
        await rollbackFunction();
        migration.executed = false;
        console.log(`Rollback ${migration.name} réussi`);
      }
    } catch (error) {
      console.error(`Erreur lors du rollback ${migration.name}:`, error);
      throw error;
    }
  }
}

export default MigrationManager;
```

#### Exécution des migrations
```bash
# Vérifier l'état de la base de données
# Les migrations sont gérées automatiquement par Mongoose

# Vérifier la connexion
npm run health-check

# Valider les schémas
npm run test:coverage
```

## 🔐 Rotation des secrets

### Politique de rotation

#### Quand faire une rotation ?
- **JWT_SECRET** : En cas de compromission ou changement de sécurité
- **MongoDB URI** : En cas de changement de fournisseur ou de cluster
- **API Keys externes** : Selon la politique du fournisseur ou en cas de compromission

#### Processus de rotation
1. **Génération** de nouveaux secrets
2. **Mise à jour** des variables d'environnement dans Railway
3. **Redémarrage** de l'application
4. **Validation** du bon fonctionnement

### Implémentation de la rotation

#### Rotation des secrets JWT
```javascript
// scripts/rotateJWTSecrets.js
import crypto from 'crypto';

export const rotateJWTSecrets = async () => {
  try {
    console.log('Début de la rotation des secrets JWT');

    // 1. Générer un nouveau secret
    const newJWTSecret = crypto.randomBytes(64).toString('hex');

    // 2. Sauvegarder l'ancien secret (temporairement)
    const oldJWTSecret = process.env.JWT_SECRET;

    // 3. Mettre à jour la variable d'environnement
    process.env.JWT_SECRET = newJWTSecret;

    console.log('Rotation du secret JWT réussie');

    // 4. Mettre à jour la variable dans Railway
    // Aller dans Railway → Variables → JWT_SECRET → Nouvelle valeur

    return {
      newJWTSecret,
      oldJWTSecret
    };

  } catch (error) {
    console.error('Erreur lors de la rotation du secret JWT:', error);

    // Restaurer l'ancien secret en cas d'erreur
    if (oldJWTSecret) process.env.JWT_SECRET = oldJWTSecret;

    throw error;
  }
};
```

#### Rotation des connexions MongoDB
```javascript
// scripts/rotateMongoURI.js
import mongoose from 'mongoose';

export const rotateMongoURI = async (newURI) => {
  try {
    console.log('Début de la rotation de la connexion MongoDB');

    // 1. Tester la nouvelle connexion
    const testConnection = mongoose.createConnection(newURI);
    await testConnection.asPromise();

    // 2. Vérifier l'accès aux données
    const collections = await testConnection.db.listCollections().toArray();
    console.log('Collections accessibles:', collections.map(c => c.name));

    // 3. Fermer la connexion de test
    await testConnection.close();

    // 4. Mettre à jour la connexion principale
    const oldURI = process.env.MONGO_URI;
    process.env.MONGO_URI = newURI;

    // 5. Redémarrer la connexion
    await mongoose.disconnect();
    await mongoose.connect(newURI);

    console.log('Rotation de la connexion MongoDB réussie');

    // 6. Mettre à jour les variables Railway
    // railway variables set MONGO_URI=newURI

    return {
      newURI,
      oldURI
    };

  } catch (error) {
    console.error('Erreur lors de la rotation de la connexion MongoDB:', error);

    // Restaurer l'ancienne URI en cas d'erreur
    if (oldURI) process.env.MONGO_URI = oldURI;

    throw error;
  }
};
```

### Scripts de rotation

#### Package.json
```json
{
  "scripts": {
    "rotate:jwt": "node scripts/rotateJWTSecrets.js",
    "rotate:mongo": "node scripts/rotateMongoURI.js"
  }
}
```

#### Exécution
```bash
# Rotation du secret JWT
npm run rotate:jwt

# Rotation de la connexion MongoDB
npm run rotate:mongo
```

## 🔄 Compatibilité API

### Gestion de la compatibilité

#### Versioning de l'API
- **Version majeure** : Changements incompatibles (ex: modification de la structure des réponses)
- **Version mineure** : Nouvelles fonctionnalités compatibles (ex: nouveaux champs optionnels)
- **Version patch** : Corrections de bugs sans impact sur l'API

#### Stratégies de compatibilité
1. **Documenter** clairement les changements
2. **Tester** la compatibilité avant déploiement
3. **Communiquer** les changements aux développeurs frontend

### Implémentation du versioning

#### Exemple de structure versionnée
```javascript
// routes/v1/index.js
import express from 'express';
import authRoutes from './authRoutes.js';

const router = express.Router();
router.use('/auth', authRoutes);
export default router;

// routes/v2/index.js
import express from 'express';
import authRoutes from './authRoutes.js';

const router = express.Router();
router.use('/auth', authRoutes);
export default router;
```

#### Middleware de versioning simple
```javascript
// middlewares/apiVersioning.js
export const apiVersioning = (req, res, next) => {
  // Détecter la version demandée
  const version = req.headers['api-version'] || req.query.version || 'v1';

  // Valider la version
  const supportedVersions = ['v1', 'v2'];
  if (!supportedVersions.includes(version)) {
    return res.status(400).json({
      error: 'Version API non supportée',
      supportedVersions
    });
  }

  req.apiVersion = version;
  next();
};
```

#### Exemple de gestion de compatibilité
```javascript
// utils/apiCompatibility.js
export const transformResponse = (data, version) => {
  if (version === 'v1') {
    // Transformer pour la compatibilité v1
    return transformToV1(data);
  }
  return data;
};

const transformToV1 = (data) => {
  // Exemple : transformer un nouveau format en ancien format
  if (data.profile) {
    return {
      ...data,
      name: `${data.profile.firstName} ${data.profile.lastName}`,
      profile: undefined
    };
  }
  return data;
};
```

### Documentation de la compatibilité



## 🧪 Tests et validation

### Tests de régression

#### Tests automatiques
```bash
# Tests unitaires
npm run test:run

# Tests avec couverture
npm run test:coverage

# Vérification du linting
npm run lint
```

#### Tests de compatibilité
```bash
# Tests de migration
npm run test:run

# Vérification manuelle des endpoints critiques
curl https://backend-mediatheque-production.up.railway.app/api/health
```

### Validation des migrations

#### Vérifications manuelles
```javascript
// Exemple de validation simple
export const validateMigration = async (version) => {
  try {
    console.log(`Validation de la migration ${version}`);

    // 1. Vérifier que l'application démarre
    // 2. Vérifier que les endpoints répondent
    // 3. Vérifier que les données sont accessibles

    console.log('Migration validée avec succès');
    return true;

  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    throw error;
  }
};
```

## 📚 Documentation

### Mise à jour de la documentation

#### Documents à maintenir
- [x] **README.md** : Vue d'ensemble du projet
- [x] **Guide de déploiement** : Procédures de déploiement
- [x] **Guide de mise à jour** : Ce document
- [x] **Documentation API** : Référence des endpoints

#### Processus de mise à jour
1. **Identifier** les changements documentés
2. **Mettre à jour** les sections concernées
3. **Vérifier** la cohérence globale
4. **Valider** avec l'équipe
5. **Publier** la nouvelle version

---
