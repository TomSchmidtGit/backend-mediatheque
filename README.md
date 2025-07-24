# 📚 Backend - CRM Médiathèque

## 🚀 Aperçu du projet
Ce backend est l'API REST du **CRM pour médiathèque**. Il permet la gestion des utilisateurs, des médias (livres, films, musiques), des emprunts et des avis. Il inclut une authentification sécurisée avec JWT, une documentation Swagger et une gestion avancée des rôles.

---

## 🛠 Technologies utilisées
- **Node.js + Express.js** : API REST
- **MongoDB + Mongoose** : Base de données NoSQL
- **JWT (Json Web Token)** : Authentification sécurisée
- **Cloudinary** : Stockage des images
- **Multer** : Gestion des uploads d'images
- **Swagger** : Documentation interactive
- **Jest & Supertest** : Tests unitaires et d'intégration

---

## 📥 Installation et exécution

### 1️⃣ Prérequis
- **Node.js** (v16+ recommandé)
- **MongoDB** (local ou cloud avec MongoDB Atlas)
- **Compte Cloudinary** (pour l'upload des images)
- **Git**

### 2️⃣ Cloner le repo
```bash
git clone https://github.com/ton-repo/backend-mediatheque.git
cd backend-mediatheque
```

### 3️⃣ Installer les dépendances
```bash
npm install
```

### 4️⃣ Configuration (.env)
Créer un fichier `.env` à la racine du projet :
```ini
PORT=5001
MONGO_URI=mongodb://localhost:27017/mediatheque
JWT_SECRET=tonSecretJWT

# Cloudinary
CLOUDINARY_CLOUD_NAME=ton_nom_cloudinary
CLOUDINARY_API_KEY=ta_cle_api
CLOUDINARY_API_SECRET=ton_secret_api
```

### 5️⃣ Démarrer l'API
#### En mode développement
```bash
npm run dev
```
#### En mode production
```bash
npm start
```

L'API tourne sur `http://localhost:5001`

---

## 🗃️ Documentation API (Swagger)
Swagger est activé pour documenter l'API.
Accédez à la doc interactive sur :
```bash
http://localhost:1/api/docs
```

---

## 🔒 Sécurité et authentification
- **JWT** : Tous les endpoints sensibles sont protégés par un token JWT.
- **Gestion des rôles** : Admin / Utilisateur normal.
- **Protection des routes** : Certaines routes sont accessibles uniquement aux admins.

---

## 📂 Tests
Exécuter tous les tests avec Jest :
```bash
npm test
```

---

## Déploiement
Nous prévoyons de déployer sur un **VPS avec Docker**.

---

## Auteur
Projet développé par **[Tom Schmidt]**.