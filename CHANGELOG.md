# Changelog - Backend Médiathèque

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [1.1.0] - 2025-08-14

### Added

- **APIs publiques** : Intégration des APIs externes pour la création de médias
  - Google Books API pour les livres
  - TMDB API pour les films
  - MusicBrainz API pour la musique
- **Recherche externe** : Endpoints pour rechercher des médias dans les APIs publiques
- **Import automatique** : Création de médias depuis les données des APIs externes

### Changed

- **ExternalApiService** : Service pour interagir avec les APIs publiques
- **Routes externes** : Nouveaux endpoints protégés pour la recherche externe

## [1.0.0] - 2025-08-13

### Added

- **Premier déploiement en production** avec Railway
- **API REST complète** : Endpoints pour toutes les fonctionnalités
- **Authentification JWT** : Login, inscription, gestion des tokens
- **Gestion des utilisateurs** : CRUD complet avec rôles (user, employee, admin)
- **Gestion des médias** : Livres, films, musique avec images Cloudinary
- **Gestion des emprunts** : Création, suivi, retour (admin uniquement)
- **Système de rôles** : Permissions granulaires selon le niveau d'accès
- **Sécurité** : Helmet, CORS, rate limiting, validation des entrées
- **Tests complets** : 173 tests couvrant tous les contrôleurs et services
- **CI/CD** : Hooks pre-commit, linting automatique, tests automatisés
- **Documentation** : Swagger/OpenAPI complète
- **Logs** : Winston pour la journalisation et le monitoring
- **Base de données** : MongoDB avec Mongoose, seeding automatique

### Technical

- **Node.js** avec Express.js
- **MongoDB Atlas** pour la base de données
- **JWT** pour l'authentification
- **bcryptjs** pour le hashage des mots de passe
- **Cloudinary** pour la gestion des images
- **Jest** pour les tests unitaires
- **Railway** pour le déploiement

## [0.1.0] - 2025-02-05

### Added

- **Initialisation du projet** Node.js avec Express
- **Structure de base** : Contrôleurs, modèles, routes, middlewares
- **Configuration** MongoDB, JWT, outils de développement
- **Premiers modèles** : User, Media, Category, Tag
- **Authentification de base** : Login et inscription

---

## Notes de version

- **v1.1.0** : Ajout des APIs publiques pour enrichir le catalogue
- **v1.0.0** : Première version stable et déployée en production
- **v0.1.0** : Version de développement initiale

## Support

Pour toute question ou problème, consultez le [README](./README.md) ou créez une issue sur le repository.
