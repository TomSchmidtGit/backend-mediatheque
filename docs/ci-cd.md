# 🚀 Protocole CI/CD - Backend Médiathèque

Ce document décrit les protocoles d'intégration continue et de déploiement continu pour le backend de la médiathèque.

## 📋 Table des matières

- [🔄 Protocole d'intégration continue](#-protocole-dintégration-continue)
- [🚀 Protocole de déploiement continu](#-protocole-de-déploiement-continu)
- [📊 Critères qualité & performance](#-critères-qualité--performance)
- [🌍 Matrice des environnements](#-matrice-des-environnements)
- [🔧 Configuration des outils](#-configuration-des-outils)

## 🔄 Protocole d'intégration continue

### Enchaînement pre-commit

Le workflow d'intégration suit cette séquence automatique avant chaque commit :

```bash
# Séquence automatique des hooks pre-commit
1. Linting (ESLint) → 2. Tests complets → 3. Audit sécurité → 4. Commit
```

#### 1. Linting (ESLint)
- **Objectif** : Vérification de la qualité du code
- **Seuil** : 0 erreur, 0 warning critique
- **Commande** : `npm run lint`
- **Action** : Bloque le commit si des erreurs sont détectées

#### 2. Tests complets
- **Objectif** : Vérification du bon fonctionnement
- **Commande** : `npm run test:ci`
- **Action** : Bloque le commit si des tests échouent
- **Note** : Tous les tests sont exécutés, pas seulement les tests rapides

#### 3. Audit sécurité
- **Objectif** : Vérification des vulnérabilités
- **Commande** : `npm audit --audit-level=moderate`
- **Action** : Bloque le commit si des vulnérabilités modérées+ sont détectées

### Fréquence de merge

- **Branches feature** : Merge après validation complète des tests
- **Branche principale** : `main` (production)

### Vérifications bloquantes

#### Pre-commit (bloque le commit)
- ❌ Linting avec erreurs
- ❌ Tests qui échouent
- ❌ Vulnérabilités de sécurité modérées+

#### CI/CD (bloque le merge)
- ❌ Tests qui échouent
- ❌ Linting avec erreurs
- ❌ Vulnérabilités de sécurité
- ❌ Conflits Git non résolus

## 🚀 Protocole de déploiement continu

### Déclenchement automatique

Le déploiement se déclenche automatiquement sur :
- **Push direct** sur `main` → Déploiement production
- **Merge** sur `main` → Déploiement production

### Backend → Railway

#### Séquence de déploiement

```bash
1. Build → 2. Variables d'environnement → 3. Démarrage → 4. Health check
```

#### Détail des étapes

1. **Build**
   - Installation des dépendances : `npm install`
   - Vérification de la syntaxe
   - Préparation des assets

2. **Variables d'environnement**
   - Variables configurées dans Railway
   - `.env` a configurer (se baser sur `.env.example` visible dans le repo)

3. **Démarrage**
   - Exécution de `npm start`
   - Initialisation de la base de données
   - Démarrage des services

4. **Health check**
   - Vérification de `/health`
   - Test de connexion MongoDB
   - Vérification des services externes

#### Configuration Railway

```json
// railway.json (fichier existant)
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

## 📊 Critères qualité & performance

### Backend

| Critère | Seuil | Mesure |
|---------|-------|---------|
| **Linting** | 0 erreur | ESLint |
| **Tests** | 100% passent | Jest |
| **Sécurité** | 0 vulnérabilité modérée+ | npm audit |
| **Formatage** | Conforme | Prettier |

### Métriques globales

- **Build** : Configuration automatique via NIXPACKS
- **Déploiement** : Automatique via Railway
- **Health check** : Vérification automatique sur `/health`

## 🌍 Matrice des environnements

### Environnement de développement

| Aspect | Configuration |
|--------|---------------|
| **URL** | `http://localhost:5001` |
| **Base de données** | MongoDB local ou Atlas dev |
| **Variables** | `.env` local |
| **Logs** | Console + fichiers locaux |
| **Debug** | Activé |
| **Hot reload** | Activé |

#### Commandes de lancement

```bash
cd backend-mediatheque
npm run dev
```

### Environnement de production

| Aspect | Configuration |
|--------|---------------|
| **URL** | Railway production `https://backend-mediatheque-production.up.railway.app/api` |
| **Base de données** | MongoDB Atlas production |
| **Variables** | Railway production |
| **Logs** | Winston + Railway logs |
| **Debug** | Désactivé |
| **Monitoring** | Activé |

#### Commandes de lancement

```bash
# Déploiement automatique sur push vers main
git checkout main
git push origin main
```

## 🔧 Configuration des outils

### Hooks pre-commit

#### Installation

```bash
cd backend-mediatheque
npm run setup:pre-commit
```

#### Configuration

Le fichier `.pre-commit-config.yaml` configure :
- ESLint pour la qualité du code
- Prettier pour le formatage
- Tests complets via `npm run test:ci`
- Audit de sécurité via `npm audit`

### Scripts disponibles

```json
// package.json
{
  "scripts": {
    "ci": "npm run lint && npm run format:check && npm run test:ci",
    "pre-commit:run": "pre-commit run --all-files",
    "test:ci": "Tests complets en mode CI"
  }
}
```

### Monitoring et alertes

#### Backend (Railway)

- **Logs** : Winston + Railway logs
- **Métriques** : CPU, mémoire, réseau
- **Health checks** : Endpoint `/health`
- **Alertes** : Notifications en cas de problème
