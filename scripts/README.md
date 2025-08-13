# 🌱 Scripts de Seeding - Base de Données

## 📋 **Vue d'ensemble**

Ce dossier contient les scripts pour peupler votre base de données avec des données de test et de production.

## 🗄️ **Architecture des bases de données**

```
MongoDB Atlas
├── mediatheque_test     # Développement + Tests (peut être vidée)
└── mediatheque_prod     # Production (jamais vidée)
```

**Environnements :**
- **`NODE_ENV=development`** → `mediatheque_test`
- **`NODE_ENV=production`** → `mediatheque_prod`  
- **`NODE_ENV=test`** → `mediatheque_test`

## 🚀 **Scripts disponibles**

### **1. `seedTestData.js` - Données de test complètes**
- **Usage** : `npm run seed`
- **Action** : Vide complètement la base et la remplit avec des données de test
- **Utilisation** : Développement, tests, démonstrations

**Données créées :**
- 👥 **5 utilisateurs** (2 admins + 3 utilisateurs)
- 📚 **6 catégories** (Romans, Sciences, Histoire, Art & Culture, Jeunesse, BD & Comics)
- 🏷️ **8 tags** (Bestseller, Nouveauté, Classique, etc.)
- 📖 **10 médias** (livres et BD classiques)
- 📚 **3 emprunts** de test

**Comptes de test :**
```
Admin: admin@mediatheque.fr / admin123
Bibliothécaire: bibliothecaire@mediatheque.fr / biblio123
Utilisateur: jean.dupont@email.com / user123
```

### **2. `seedProductionData.js` - Ajout de données de production**
- **Usage** : `npm run seed:prod`
- **Action** : Ajoute des données sans nettoyer la base existante
- **Utilisation** : Production, enrichissement de la base

**Données ajoutées :**
- 📚 **3 nouvelles catégories** (Informatique, Cuisine, Voyage)
- 🏷️ **4 nouveaux tags** (Technologie, Santé, Écologie, Psychologie)
- 📖 **3 nouveaux médias** (Clean Code, Cuisine Française, Art du Voyage)

## 🔧 **Utilisation**

### **Pour le développement :**
```bash
# Vider et remplir complètement la base de test
export NODE_ENV=development
npm run seed

# Ou avec l'environnement explicite
npm run seed:dev
```

### **Pour la production :**
```bash
# Ajouter des données sans nettoyer (base de prod)
export NODE_ENV=production
npm run seed:prod
```

### **Vérifier l'environnement :**
```bash
# Afficher la configuration actuelle
npm run env:info
```

### **Vérification :**
```bash
# Démarrer le serveur
npm run dev

# Vérifier dans l'interface ou via l'API
curl http://localhost:5001/api/media
curl http://localhost:5001/api/categories
curl http://localhost:5001/api/users
```

## ⚠️ **Attention**

### **`seedTestData.js` :**
- 🗑️ **VIDE COMPLÈTEMENT** la base de données
- 🔄 **Remplace** toutes les données existantes
- ⚠️ **À utiliser uniquement** en développement

### **`seedProductionData.js` :**
- ✅ **Préserve** les données existantes
- ➕ **Ajoute** seulement les nouvelles données
- 🔒 **Sécurisé** pour la production

## 🎯 **Cas d'usage recommandés**

### **Développement initial :**
```bash
npm run seed  # Créer une base complète de test
```

### **Tests frontend :**
```bash
npm run seed  # Base propre avec données cohérentes
npm run dev   # Démarrer le serveur
```

### **Démonstration :**
```bash
npm run seed  # Base avec données d'exemple
npm run dev   # Montrer l'application fonctionnelle
```

### **Production :**
```bash
npm run seed:prod  # Enrichir la base existante
```

## 🔍 **Vérification des données**

Après le seeding, vous devriez voir :
- ✅ **Interface de connexion** fonctionnelle
- ✅ **Liste des médias** avec 10+ items
- ✅ **Catégories** avec couleurs
- ✅ **Système d'emprunt** avec données de test
- ✅ **Gestion des utilisateurs** (admin/user)

## 🚨 **En cas de problème**

### **Erreur de connexion :**
- Vérifiez que MongoDB est accessible
- Vérifiez les variables d'environnement dans `.env`

### **Erreur de modèle :**
- Vérifiez que tous les modèles sont correctement importés
- Vérifiez la structure des modèles

### **Base vide après seeding :**
- Vérifiez les logs du script
- Vérifiez que le script s'est terminé sans erreur

## 📊 **Structure des données créées**

### **Utilisateurs :**
- **Admins** : Accès complet à toutes les fonctionnalités
- **Utilisateurs** : Accès limité (emprunts, profil, favoris)

### **Médias :**
- **Types variés** : Livres, BD, Comics
- **Catégories** : Romans, Sciences, Histoire, etc.
- **Tags** : Bestseller, Classique, Nouveauté, etc.
- **Disponibilité** : Tous disponibles par défaut

### **Emprunts :**
- **En cours** : Jean Dupont → Le Petit Prince
- **En cours** : Marie Martin → 1984
- **En retard** : Pierre Durand → Le Seigneur des Anneaux

## 🎉 **Résultat attendu**

Après le seeding, votre application devrait être **entièrement fonctionnelle** avec :
- ✅ **Authentification** complète
- ✅ **Gestion des médias** avec données
- ✅ **Système d'emprunt** opérationnel
- ✅ **Interface utilisateur** riche en contenu
- ✅ **Tests frontend** possibles avec données réelles
