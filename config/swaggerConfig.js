import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * security:
 *   - bearerAuth: []
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Médiathèque API',
      version: '1.0.0',
      description: 'Documentation de l’API de gestion de médiathèque',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Serveur local',
      },
    ],
  },
  apis: ['./routes/*.js'], // On cible tous les fichiers de routes
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = app => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerDocs;
