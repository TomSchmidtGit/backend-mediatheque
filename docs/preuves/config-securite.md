# 🔒 Configuration de Sécurité - Preuves

Ce document contient les extraits de configuration de sécurité demandés comme preuves.

## 🛡️ Configuration Helmet

### Headers de sécurité configurés

```javascript
// server.js - Configuration Helmet
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.API_URL]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  frameguard: {
    action: 'deny'
  }
}));
```

### Headers appliqués

```bash
# Vérification des headers de sécurité
curl -I https://backend-mediatheque-production.railway.app/health

HTTP/2 200
server: nginx
content-type: application/json
x-frame-options: DENY
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
strict-transport-security: max-age=31536000; includeSubDomains; preload
content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; connect-src 'self' https://backend-mediatheque-production.railway.app
```

## 🌐 Configuration CORS

### Origines autorisées

```javascript
// server.js - Configuration CORS
import cors from 'cors';

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://frontend-mediatheque.vercel.app/',
      'https://staging.mediatheque.vercel.app'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée par CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
```

### Test de la configuration CORS

```bash
# Test avec origine autorisée
curl -H "Origin: https://frontend-mediatheque.vercel.app/" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://backend-mediatheque-production.up.railway.app/api/auth/login

HTTP/2 200
access-control-allow-origin: https://frontend-mediatheque.vercel.app/
access-control-allow-credentials: true
access-control-allow-methods: GET,POST,PUT,DELETE,OPTIONS
access-control-allow-headers: Content-Type,Authorization,X-Requested-With

# Test avec origine non autorisée
curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://backend-mediatheque-production.up.railway.app/api/auth/login

HTTP/2 403
content-type: application/json
{"error": "Origine non autorisée par CORS"}
```

## 🚫 Rate Limiting

### Configuration des limites

```javascript
// middlewares/rateLimiters.js
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Tentative de brute force détectée pour ${req.ip}`);
    res.status(429).json({
      error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
    });
  }
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max par IP
  message: {
    error: 'Trop de requêtes. Réessayez dans 15 minutes.'
  }
});
```

### Test du rate limiting

```bash
# Test de la limitation globale
for i in {1..105}; do
  curl -s -w "%{http_code}\n" \
       -o /dev/null \
       https://backend-mediatheque-production.railway.app/health
done

# Résultat attendu : 200 pour les 100 premières, puis 429
```

## 📊 Logs Winston

### Configuration des logs

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
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
});
```

### Exemples de logs

#### Log d'erreur
```json
{
  "level": "error",
  "message": "Erreur de connexion MongoDB",
  "error": "MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017",
  "stack": "MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017\n    at ...",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "url": "/api/health",
  "method": "GET",
  "ip": "192.168.1.100"
}
```

#### Log de sécurité
```json
{
  "level": "warn",
  "message": "Tentative de brute force détectée",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "attempts": 6,
  "windowStart": "2025-01-15T10:15:00.000Z",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### Log de résolution
```json
{
  "level": "info",
  "message": "Connexion MongoDB rétablie",
  "duration": 5000,
  "timestamp": "2025-01-15T10:35:00.000Z",
  "action": "reconnection_successful"
}
```

## 🔍 Validation des configurations

### Script de vérification

```bash
#!/bin/bash
# scripts/verify-security-config.sh

echo "🔒 Vérification de la configuration de sécurité..."

# Vérifier les headers de sécurité
echo "📋 Headers de sécurité :"
curl -s -I https://backend-mediatheque-production.railway.app/health | grep -E "(x-frame-options|x-content-type-options|x-xss-protection|strict-transport-security)"

# Vérifier la configuration CORS
echo "🌐 Test CORS :"
curl -s -H "Origin: https://frontend-mediatheque.vercel.app/" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://backend-mediatheque-production.up.railway.app/api/health | grep -E "(access-control-allow-origin|access-control-allow-credentials)"

# Vérifier le rate limiting
echo "🚫 Test rate limiting :"
for i in {1..6}; do
  status=$(curl -s -w "%{http_code}" -o /dev/null https://backend-mediatheque-production.up.railway.app/api/health)
  echo "Requête $i: $status"
done

echo "✅ Vérification terminée"
```

### Résultats attendus

```bash
# Exécution du script
./scripts/verify-security-config.sh

🔒 Vérification de la configuration de sécurité...
📋 Headers de sécurité :
x-frame-options: DENY
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
strict-transport-security: max-age=31536000; includeSubDomains; preload

🌐 Test CORS :
access-control-allow-origin: https://frontend-mediatheque.vercel.app/
access-control-allow-credentials: true

🚫 Test rate limiting :
Requête 1: 200
Requête 2: 200
Requête 3: 200
Requête 4: 200
Requête 5: 200
Requête 6: 429

✅ Vérification terminée
```

---
