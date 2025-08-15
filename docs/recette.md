# 🧪 Cahier de Tests Fonctionnels - Backend Médiathèque

Ce document décrit les tests fonctionnels et les scénarios de recette pour l'API de médiathèque.

## 📋 Table des matières

- [🎯 Objectifs des tests](#-objectifs-des-tests)
- [🔍 Scénarios de test](#-scénarios-de-test)
- [📊 Résultats des tests](#-résultats-des-tests)
- [✅ Critères de validation](#-critères-de-validation)

## 🎯 Objectifs des tests

Les tests fonctionnels ont pour objectif de vérifier :
- Le bon fonctionnement des fonctionnalités principales
- La conformité aux spécifications métier
- L'expérience utilisateur (UX)
- La robustesse de l'application
- La compatibilité multi-navigateurs

## 🔍 Scénarios de test

### 1. Authentification et gestion des comptes

#### Scénario : Inscription d'un nouvel utilisateur
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Accéder à la page d'inscription | Page d'inscription s'affiche | ✅ | ✅ | - |
| 2 | Remplir le formulaire avec des données valides | Validation des champs | ✅ | ✅ | - |
| 3 | Soumettre le formulaire | Compte créé, redirection vers connexion | ✅ | ✅ | - |
| 4 | Vérifier l'email de confirmation | Email reçu avec lien de validation | ✅ | ✅ | - |
| 5 | Valider le compte via l'email | Compte activé, connexion possible | ✅ | ✅ | - |

#### Scénario : Connexion utilisateur
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Accéder à la page de connexion | Page de connexion s'affiche | ✅ | ✅ | - |
| 2 | Saisir identifiants valides | Validation des champs | ✅ | ✅ | - |
| 3 | Soumettre le formulaire | Connexion réussie, redirection dashboard | ✅ | ✅ | - |
| 4 | Vérifier la persistance de session | Session maintenue après rafraîchissement | ✅ | ✅ | - |
| 5 | Tester la déconnexion | Déconnexion réussie, redirection accueil | ✅ | ✅ | - |

#### Scénario : Récupération de mot de passe
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Accéder à la page "Mot de passe oublié" | Page de récupération s'affiche | ✅ | ✅ | - |
| 2 | Saisir un email valide | Validation de l'email | ✅ | ✅ | - |
| 3 | Soumettre la demande | Email de récupération envoyé | ✅ | ✅ | - |
| 4 | Cliquer sur le lien de récupération | Page de réinitialisation s'affiche | ✅ | ✅ | - |
| 5 | Saisir un nouveau mot de passe | Mot de passe mis à jour | ✅ | ✅ | - |

### 2. Recherche et navigation dans le catalogue

#### Scénario : Recherche simple de médias
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Accéder à la page catalogue | Catalogue s'affiche avec médias | ✅ | ✅ | - |
| 2 | Utiliser la barre de recherche | Résultats s'affichent en temps réel | ✅ | ✅ | - |
| 3 | Tester avec différents termes | Résultats pertinents | ✅ | ✅ | - |
| 4 | Vérifier la pagination | Navigation entre les pages | ✅ | ✅ | - |
| 5 | Tester les filtres | Filtrage correct des résultats | ✅ | ✅ | - |

#### Scénario : Navigation par catégories
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Cliquer sur une catégorie | Médias de la catégorie s'affichent | ✅ | ✅ | - |
| 2 | Naviguer entre catégories | Changement de contexte | ✅ | ✅ | - |
| 3 | Tester les sous-catégories | Hiérarchie respectée | ✅ | ✅ | - |
| 4 | Vérifier le compteur | Nombre correct de médias | ✅ | ✅ | - |
| 5 | Tester le retour à l'accueil | Navigation cohérente | ✅ | ✅ | - |

#### Scénario : Détails d'un média
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Cliquer sur un média | Page de détails s'affiche | ✅ | ✅ | - |
| 2 | Vérifier les informations | Métadonnées complètes | ✅ | ✅ | - |
| 3 | Tester l'ajout aux favoris | Favori ajouté/supprimé | ✅ | ✅ | - |
| 4 | Vérifier la disponibilité | Statut correct affiché | ✅ | ✅ | - |
| 5 | Tester l'emprunt | Processus d'emprunt | ✅ | ✅ | - |

### 3. Gestion des emprunts et retours

#### Scénario : Emprunt d'un média
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Sélectionner un média disponible | Bouton d'emprunt actif | ✅ | ✅ | - |
| 2 | Cliquer sur "Emprunter" | Modal de confirmation s'affiche | ✅ | ✅ | - |
| 3 | Confirmer l'emprunt | Emprunt créé, confirmation | ✅ | ✅ | - |
| 4 | Vérifier l'historique | Emprunt visible dans la liste | ✅ | ✅ | - |
| 5 | Vérifier l'email de confirmation | Email reçu | ✅ | ✅ | - |

#### Scénario : Retour d'un média
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Accéder à "Mes emprunts" | Liste des emprunts actifs | ✅ | ✅ | - |
| 2 | Sélectionner un emprunt | Détails de l'emprunt | ✅ | ✅ | - |
| 3 | Cliquer sur "Retourner" | Modal de confirmation | ✅ | ✅ | - |
| 4 | Confirmer le retour | Retour enregistré | ✅ | ✅ | - |
| 5 | Vérifier la mise à jour | Statut mis à jour | ✅ | ✅ | - |

#### Scénario : Prolongation d'emprunt
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Sélectionner un emprunt actif | Bouton de prolongation visible | ✅ | ✅ | - |
| 2 | Cliquer sur "Prolonger" | Confirmation de prolongation | ✅ | ✅ | - |
| 3 | Vérifier la nouvelle date | Date mise à jour | ✅ | ✅ | - |
| 4 | Vérifier l'historique | Prolongation enregistrée | ✅ | ✅ | - |
| 5 | Tester la limite de prolongations | Limite respectée | ✅ | ✅ | - |

### 4. Administration et gestion

#### Scénario : Tableau de bord administrateur
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Se connecter en tant qu'admin | Accès au dashboard admin | ✅ | ✅ | - |
| 2 | Vérifier les statistiques | Données correctes affichées | ✅ | ✅ | - |
| 3 | Consulter les alertes | Alertes pertinentes | ✅ | ✅ | - |
| 4 | Vérifier l'activité récente | Activité mise à jour | ✅ | ✅ | - |
| 5 | Tester la navigation | Accès à toutes les sections | ✅ | ✅ | - |

#### Scénario : Gestion des utilisateurs
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Accéder à la gestion des utilisateurs | Liste des utilisateurs | ✅ | ✅ | - |
| 2 | Rechercher un utilisateur | Résultats de recherche | ✅ | ✅ | - |
| 3 | Modifier un profil | Mise à jour réussie | ✅ | ✅ | - |
| 4 | Désactiver un compte | Statut mis à jour | ✅ | ✅ | - |
| 5 | Vérifier les permissions | Droits respectés | ✅ | ✅ | - |

#### Scénario : Gestion des médias
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Accéder à la gestion des médias | Catalogue administrateur | ✅ | ✅ | - |
| 2 | Ajouter un nouveau média | Formulaire d'ajout | ✅ | ✅ | - |
| 3 | Remplir et soumettre | Média créé | ✅ | ✅ | - |
| 4 | Modifier un média existant | Mise à jour réussie | ✅ | ✅ | - |
| 5 | Supprimer un média | Suppression confirmée | ✅ | ✅ | - |

### 5. Intégration des APIs externes

#### Scénario : Recherche Google Books
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Utiliser la recherche externe | Interface de recherche | ✅ | ✅ | - |
| 2 | Rechercher un livre | Résultats de l'API | ✅ | ✅ | - |
| 3 | Sélectionner un résultat | Détails du livre | ✅ | ✅ | - |
| 4 | Importer les métadonnées | Données récupérées | ✅ | ✅ | - |
| 5 | Créer le média | Média ajouté au catalogue | ✅ | ✅ | - |

#### Scénario : Recherche TMDB (films)
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Accéder à la recherche films | Interface de recherche | ✅ | ✅ | - |
| 2 | Rechercher un film | Résultats de l'API | ✅ | ✅ | - |
| 3 | Consulter les détails | Informations complètes | ✅ | ✅ | - |
| 4 | Importer les données | Métadonnées récupérées | ✅ | ✅ | - |
| 5 | Ajouter au catalogue | Film disponible | ✅ | ✅ | - |

#### Scénario : Recherche MusicBrainz
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Utiliser la recherche musique | Interface de recherche | ✅ | ✅ | - |
| 2 | Rechercher un album | Résultats de l'API | ✅ | ✅ | - |
| 3 | Consulter les détails | Informations de l'album | ✅ | ✅ | - |
| 4 | Importer les métadonnées | Données récupérées | ✅ | ✅ | - |
| 5 | Créer le média | Album ajouté | ✅ | ✅ | - |

### 6. Tests de robustesse

#### Scénario : Gestion des erreurs
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Tester avec données invalides | Messages d'erreur appropriés | ✅ | ✅ | - |
| 2 | Simuler une panne API | Gestion gracieuse | ✅ | ✅ | - |
| 3 | Tester la validation | Erreurs de validation | ✅ | ✅ | - |
| 4 | Vérifier les logs | Erreurs enregistrées | ✅ | ✅ | - |
| 5 | Tester la récupération | Retour à l'état normal | ✅ | ✅ | - |

#### Scénario : Performance et charge
| Étape | Action | Attendu | Obtenu | Statut | Issue/PR |
|-------|--------|---------|---------|---------|-----------|
| 1 | Charger le catalogue | Temps de réponse < 2s | ✅ | ✅ | - |
| 2 | Recherche en temps réel | Réactivité < 500ms | ✅ | ✅ | - |
| 3 | Pagination | Navigation fluide | ✅ | ✅ | - |
| 4 | Upload d'images | Traitement < 5s | ✅ | ✅ | - |
| 5 | Export de données | Génération < 10s | ✅ | ✅ | - |

## 📊 Résultats des tests

### Résumé global
- **Tests exécutés** : 173
- **Tests réussis** : 173
- **Tests échoués** : 0
- **Taux de succès** : 100%

### Répartition par fonctionnalité
| Fonctionnalité | Tests | Réussis | Échoués | Taux |
|----------------|-------|---------|---------|------|
| Authentification | 35 | 35 | 0 | 100% |
| Utilisateurs | 30 | 30 | 0 | 100% |
| Emprunts | 25 | 25 | 0 | 100% |
| Médias | 32 | 32 | 0 | 100% |
| Catégories | 20 | 20 | 0 | 100% |
| Tags | 20 | 20 | 0 | 100% |
| Contact | 10 | 10 | 0 | 100% |
| APIs externes | 12 | 12 | 0 | 100% |
| Dashboard | 9 | 9 | 0 | 100% |

### Environnements testés
- ✅ **Développement local** : Tous les tests passent
- ✅ **Tests automatisés** : 173 tests passent

### Fichiers de test
- `tests/auth.test.js` : 35 tests
- `tests/user.test.js` : 30 tests
- `tests/borrow.test.js` : 25 tests
- `tests/media.test.js` : 32 tests
- `tests/category.test.js` : 20 tests
- `tests/tag.test.js` : 20 tests
- `tests/contact.test.js` : 10 tests
- `tests/externalApi.test.js` : 12 tests
- `tests/dashboard.test.js` : 9 tests

## ✅ Critères de validation

### Critères fonctionnels
- [x] Toutes les fonctionnalités principales fonctionnent
- [x] Les workflows utilisateur sont complets
- [x] La gestion des erreurs est appropriée
- [x] Les performances sont acceptables

### Critères techniques
- [x] Les tests passent en local
- [x] La couverture de code est suffisante
- [x] Les logs sont appropriés
- [x] La sécurité est respectée

### Critères métier
- [x] Les règles métier sont respectées
- [x] L'expérience utilisateur est satisfaisante
- [x] Les données sont cohérentes
- [x] Les processus sont optimisés

---
