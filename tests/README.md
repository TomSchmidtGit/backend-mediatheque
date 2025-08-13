# Suite de Tests - Backend Médiathèque

## Vue d'ensemble

Cette suite de tests couvre l'intégralité des fonctionnalités du backend de l'application médiathèque. Elle utilise Jest comme framework de test et Supertest pour tester les API REST.

## Structure des Tests

```
tests/
├── setup.js                 # Configuration globale des tests
├── utils/
│   └── testHelpers.js      # Utilitaires et helpers pour les tests
├── auth.test.js            # Tests d'authentification
├── user.test.js            # Tests des utilisateurs
├── media.test.js           # Tests des médias
├── borrow.test.js          # Tests des emprunts
├── category.test.js        # Tests des catégories
├── tag.test.js             # Tests des tags
├── dashboard.test.js       # Tests du dashboard
├── contact.test.js         # Tests des contacts
└── README.md               # Ce fichier
```

## Configuration

### Dépendances

- **Jest** : Framework de test principal
- **Supertest** : Test des API HTTP
- **mongodb-memory-server** : Base de données en mémoire pour les tests

### Configuration Jest

La configuration Jest se trouve dans `package.json` et inclut :

- Base de données en mémoire pour l'isolation des tests
- Nettoyage automatique entre les tests
- Seuils de couverture de code (80%)
- Timeout de 30 secondes par test
- Mode verbose activé

## Scripts de Test

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Exécuter les tests avec couverture
npm run test:coverage

# Exécuter les tests en mode CI
npm run test:ci

# Exécuter les tests en mode debug
npm run test:debug
```

## Utilitaires de Test

### `testHelpers.js`

Ce fichier contient des fonctions utilitaires pour faciliter l'écriture des tests :

- **Création d'utilisateurs** : `createTestUser()`, `createTestAdmin()`
- **Authentification** : `createAndLoginUser()`, `createAndLoginAdmin()`
- **Données de test** : `createTestMediaData()`, `createTestCategoryData()`, etc.
- **Assertions** : `expectSuccessResponse()`, `expectErrorResponse()`, `expectResponseStructure()`

### Exemple d'utilisation

```javascript
import { 
  createAndLoginUser, 
  createTestMediaData,
  expectSuccessResponse 
} from './utils/testHelpers.js';

describe('Media Tests', () => {
  let user, userToken;

  beforeAll(async () => {
    const userData = await createAndLoginUser();
    user = userData.user;
    userToken = userData.token;
  });

  test('Should create media', async () => {
    const mediaData = createTestMediaData();
    // ... test implementation
  });
});
```

## Couverture des Tests

### Routes Testées

1. **Authentification** (`/api/auth`)
   - Inscription, connexion, déconnexion
   - Rafraîchissement de tokens
   - Réinitialisation de mot de passe
   - Validation des données

2. **Utilisateurs** (`/api/users`)
   - CRUD complet des utilisateurs
   - Gestion des rôles et permissions
   - Profils utilisateur
   - Validation des données

3. **Médias** (`/api/media`)
   - CRUD complet des médias
   - Upload d'images
   - Filtrage et recherche
   - Gestion des catégories et tags

4. **Emprunts** (`/api/borrow`)
   - Création et gestion des emprunts
   - Retours et prolongations
   - Statistiques et rapports
   - Validation des dates

5. **Catégories** (`/api/categories`)
   - CRUD complet des catégories
   - Génération automatique de slugs
   - Gestion des médias associés

6. **Tags** (`/api/tags`)
   - CRUD complet des tags
   - Génération automatique de slugs
   - Recherche et filtrage

7. **Dashboard** (`/api/dashboard`)
   - Statistiques globales
   - Activité récente
   - Emprunts en retard
   - Tendances et alertes

8. **Contact** (`/api/contact`)
   - Formulaire de contact
   - Gestion des messages
   - Statistiques et rapports

### Aspects Testés

- **Fonctionnalités** : Toutes les opérations CRUD
- **Validation** : Données d'entrée et formats
- **Authentification** : Tokens JWT et rôles
- **Autorisations** : Contrôle d'accès par rôle
- **Gestion d'erreurs** : Codes HTTP et messages
- **Sécurité** : Protection contre les injections
- **Performance** : Pagination et filtrage

## Bonnes Pratiques

### Organisation des Tests

- **Structure** : Tests organisés par route/ressource
- **Setup** : Configuration commune dans `beforeAll`
- **Nettoyage** : Base de données nettoyée entre les tests
- **Isolation** : Chaque test est indépendant

### Naming Convention

- **Descriptions** : En français, claires et descriptives
- **Fonctions** : Préfixées par "Doit" pour clarifier l'intention
- **Groupes** : Organisés par fonctionnalité avec `describe`

### Assertions

- **Réponses** : Vérification des codes HTTP et structures
- **Données** : Validation du contenu des réponses
- **Erreurs** : Test des cas d'erreur et messages
- **Sécurité** : Vérification des permissions et accès

## Exécution des Tests

### Environnement

Les tests s'exécutent dans un environnement isolé avec :
- Base de données MongoDB en mémoire
- Variables d'environnement de test
- Logs supprimés pour la clarté

### Isolation

Chaque test :
- Crée ses propres données de test
- N'utilise pas de données persistantes
- Se nettoie automatiquement après exécution

### Performance

- **Parallélisation** : Tests exécutés en série pour éviter les conflits
- **Timeout** : 30 secondes maximum par test
- **Mémoire** : Base de données en mémoire pour la rapidité

## Maintenance

### Ajout de Nouveaux Tests

1. Créer le fichier de test dans le dossier approprié
2. Importer les utilitaires nécessaires
3. Suivre la structure existante
4. Ajouter les tests dans la suite principale

### Mise à Jour des Tests

- Maintenir la cohérence avec l'API
- Mettre à jour les validations si nécessaire
- Ajouter des tests pour les nouvelles fonctionnalités

### Débogage

- Utiliser `npm run test:debug` pour le débogage
- Vérifier les logs de la base de données
- Utiliser les utilitaires de test pour la création de données

## Couverture de Code

La suite de tests vise une couverture de 80% minimum sur :
- Contrôleurs
- Middlewares
- Modèles
- Routes
- Utilitaires

### Génération du Rapport

```bash
npm run test:coverage
```

Le rapport sera généré dans le dossier `coverage/` avec :
- Couverture par ligne
- Couverture par fonction
- Couverture par branche
- Couverture par instruction

## Intégration Continue

### Script CI

```bash
npm run test:ci
```

Ce script :
- Exécute tous les tests
- Génère un rapport de couverture
- Vérifie les seuils de couverture
- Se termine avec un code d'erreur si les tests échouent

### Pipeline CI/CD

Les tests peuvent être intégrés dans un pipeline CI/CD :
- Exécution automatique sur chaque commit
- Vérification de la couverture de code
- Blocage du déploiement si les tests échouent
- Génération de rapports automatisés

## Support et Maintenance

### Dépannage

- **Tests qui échouent** : Vérifier la configuration de la base de données
- **Timeouts** : Augmenter le timeout dans la configuration Jest
- **Données manquantes** : Vérifier les utilitaires de test

### Évolutions

- **Nouvelles routes** : Ajouter les tests correspondants
- **Nouveaux modèles** : Créer les utilitaires de test appropriés
- **Changements d'API** : Mettre à jour les tests existants

Cette suite de tests garantit la qualité et la fiabilité du backend de l'application médiathèque.
