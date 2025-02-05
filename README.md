# Backend - CRM Médiathèque

## Aperçu du projet
Ce backend est l'API REST du **CRM pour médiathèque**. Il permet la gestion des utilisateurs, des médias (livres, films, musiques), des emprunts et des retours. Il inclut une authentification sécurisée avec JWT, une documentation Swagger et un système avancé de gestion des rôles.

---

## Technologies utilisées
- **Node.js + Express.js** : API REST
- **MongoDB** : Base de données NoSQL (Mongoose)
- **JWT (Json Web Token)** : Authentification sécurisée
- **Bcrypt.js** : Hachage des mots de passe
- **Helmet & CORS** : Sécurisation des requêtes HTTP
- **Swagger** : Documentation interactive de l'API
- **Jest & Supertest** : Tests unitaires et d'intégration

---

## Installation et exécution

### Prérequis
- **Node.js**
- **MongoDB**
- **Git**

### Cloner le repo
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
PORT=5000
MONGO_URI=mongodb://localhost:27017/mediatheque
JWT_SECRET=tonSecretJWT
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

L'API tourne sur `http://localhost:5000`

---

## 🗃️ Documentation API (Swagger)
Swagger est activé pour documenter l'API.
Accédez à la doc interactive sur :
```bash
http://localhost:5000/api/docs
```

---

## 🔒 Sécurité et authentification
- **JWT** : Tous les endpoints sensibles sont protégés par un token JWT.
- **Gestion des rôles** : Admin / Utilisateur normal.
- **Protection des routes** : Certaines routes sont accessibles uniquement aux admins.

---

## 📈 Endpoints principaux
### 🔑 Authentification
| Méthode | Route                | Description                 | Protection |
|----------|---------------------|-----------------------------|------------|
| POST     | `/api/auth/register` | Inscription utilisateur    | Public     |
| POST     | `/api/auth/login`    | Connexion utilisateur      | Public     |
| POST     | `/api/auth/logout`   | Déconnexion utilisateur    | Protégée   |

### 👨‍💻 Utilisateurs
| Méthode | Route        | Description            | Protection |
|----------|------------|------------------------|------------|
| GET      | `/api/users`  | Récupérer tous les utilisateurs | Admin |
| PUT      | `/api/users/:id` | Modifier un utilisateur | Admin |

### 🎧 Médias
| Méthode | Route        | Description              | Protection |
|----------|------------|--------------------------|------------|
| GET      | `/api/media`  | Liste tous les médias    | Public     |
| POST     | `/api/media`  | Ajouter un média        | Admin      |
| PUT      | `/api/media/:id` | Modifier un média     | Admin      |
| DELETE   | `/api/media/:id` | Supprimer un média    | Admin      |

### 📚 Emprunts
| Méthode | Route                 | Description         | Protection |
|----------|----------------------|---------------------|------------|
| POST     | `/api/borrow`        | Emprunter un média | Protégée   |
| PUT      | `/api/borrow/:id/return` | Retourner un média | Protégée   |

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