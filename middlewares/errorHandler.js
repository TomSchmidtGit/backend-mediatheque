import logger from '../config/logger.js';

// Middleware de gestion des erreurs MongoDB
export const handleMongoErrors = (error, req, res, next) => {
  // Erreurs de connexion MongoDB
  if (
    error.name === 'MongoNotConnectedError' ||
    error.name === 'MongoNetworkError' ||
    error.name === 'MongoTimeoutError'
  ) {
    logger.error(`Erreur de connexion MongoDB: ${error.message}`);

    return res.status(503).json({
      error: 'Service temporairement indisponible',
      message: 'Problème de connexion à la base de données',
      retryAfter: 30,
      timestamp: new Date().toISOString(),
    });
  }

  // Erreurs de validation MongoDB
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(
      err => err.message
    );

    logger.warn(`Erreur de validation: ${validationErrors.join(', ')}`);

    return res.status(400).json({
      error: 'Données invalides',
      message: 'Les données fournies ne respectent pas le format attendu',
      details: validationErrors,
    });
  }

  // Erreurs de duplication MongoDB
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[field];

    logger.warn(`Tentative de duplication: ${field} = ${value}`);

    return res.status(409).json({
      error: 'Conflit',
      message: `${field} '${value}' existe déjà`,
      field,
      value,
    });
  }

  // Erreurs de référence MongoDB
  if (error.name === 'CastError') {
    logger.warn(`Erreur de type: ${error.message}`);

    return res.status(400).json({
      error: 'Type invalide',
      message: 'Le type de données fourni est incorrect',
      field: error.path,
      expectedType: error.kind,
    });
  }

  // Erreurs de base de données génériques
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    logger.error(`Erreur MongoDB: ${error.message}`);

    return res.status(500).json({
      error: 'Erreur de base de données',
      message: "Une erreur est survenue lors de l'accès aux données",
      timestamp: new Date().toISOString(),
    });
  }

  // Si ce n'est pas une erreur MongoDB, passer au middleware suivant
  next(error);
};

// Middleware de gestion des erreurs génériques
export const handleGenericErrors = (error, req, res, next) => {
  logger.error(`Erreur générique: ${error.message}`, {
    stack: error.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
  });

  // Erreurs JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: "Le token d'authentification est invalide",
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: "Le token d'authentification a expiré",
    });
  }

  // Erreurs de validation des données
  if (error.name === 'SyntaxError' && error.status === 400) {
    return res.status(400).json({
      error: 'Données invalides',
      message: 'Le format des données reçues est incorrect',
    });
  }

  // Erreur par défaut
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message:
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Une erreur inattendue est survenue',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

// Middleware de gestion des erreurs asynchrones
export const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
