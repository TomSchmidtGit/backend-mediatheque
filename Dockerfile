# Dockerfile pour le backend médiathèque
FROM node:18-alpine AS base

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Stage de développement
FROM base AS development
RUN npm install -g nodemon
COPY . .
EXPOSE 5001
CMD ["npm", "run", "dev"]

# Stage de production
FROM base AS production
# Copier le code source
COPY . .

# Créer le répertoire logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 5001

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Commande de démarrage
CMD ["npm", "start"]
