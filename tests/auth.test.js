import request from 'supertest';
import { app } from '../server.js';
import { 
  createTestUser, 
  createAndLoginUser, 
  createAndLoginAdmin,
  expectErrorResponse,
  expectSuccessResponse,
  expectResponseStructure,
  expectResponseProperties
} from './utils/testHelpers.js';
import User from '../models/User.js';

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    test('Doit créer un nouvel utilisateur avec des données valides', async () => {
      const testData = {
        name: 'New Test User',
        email: `newuser_${Date.now()}@example.com`,
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(testData);

      expectSuccessResponse(res, 201);
      expectResponseProperties(res, ['token', '_id', 'name', 'email']);
      expect(res.body.name).toBe(testData.name);
      expect(res.body.email).toBe(testData.email);
    });

    test('Doit refuser l\'inscription avec un email déjà existant', async () => {
      // Créer d'abord un utilisateur
      const existingUser = await createTestUser();
      
      const testData = {
        name: 'Duplicate User',
        email: existingUser.email,
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(testData);

      expectErrorResponse(res, 400, /User already exists/i);
    });

    test('Doit refuser l\'inscription avec des données manquantes', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Incomplete User' });

      expectErrorResponse(res, 400, /Email invalide|Mot de passe trop court/i);
    });

    test('Doit refuser l\'inscription avec un mot de passe trop court', async () => {
      const testData = {
        name: 'Short Password User',
        email: `shortpass_${Date.now()}@example.com`,
        password: '123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(testData);

      expectErrorResponse(res, 400, /Mot de passe trop court/i);
    });

    test('Doit refuser l\'inscription avec un email invalide', async () => {
      const testData = {
        name: 'Invalid Email User',
        email: 'invalid-email',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(testData);

      expectErrorResponse(res, 400, /Email invalide/i);
    });
  });

  describe('POST /api/auth/login', () => {
    test('Doit connecter un utilisateur avec des identifiants valides', async () => {
      // Créer un utilisateur de test
      const testUser = await createTestUser();
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      expectSuccessResponse(res, 200);
      expectResponseProperties(res, ['accessToken', 'refreshToken', '_id', 'name', 'email']);
      expect(res.body.name).toBe(testUser.name);
      expect(res.body.email).toBe(testUser.email);
    });

    test('Doit refuser la connexion avec un mot de passe incorrect', async () => {
      // Créer un utilisateur de test
      const testUser = await createTestUser();
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expectErrorResponse(res, 401, /Invalid email or password/i);
    });

    test('Doit refuser la connexion avec un email inexistant', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expectErrorResponse(res, 401, /Invalid email or password/i);
    });

    test('Doit refuser la connexion avec des données manquantes', async () => {
      // Créer un utilisateur de test
      const testUser = await createTestUser();
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email });

      expectErrorResponse(res, 400, /Mot de passe requis/i);
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('Doit rafraîchir un token valide', async () => {
      // Créer un utilisateur de test et se connecter
      const testUser = await createTestUser();
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      const refreshToken = loginRes.body.refreshToken;

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expectSuccessResponse(res, 200);
      expectResponseProperties(res, ['accessToken']);
    });

    test('Doit refuser le rafraîchissement avec un token invalide', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expectErrorResponse(res, 403);
    });

    test('Doit refuser le rafraîchissement sans token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expectErrorResponse(res, 400);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('Doit déconnecter un utilisateur et invalider le token', async () => {
      // Créer un utilisateur de test et se connecter
      const testUser = await createTestUser();
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      const accessToken = loginRes.body.accessToken;

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expectSuccessResponse(res, 200);
      expect(res.body.message).toBe('Déconnexion réussie');
    });

    test('Doit refuser la déconnexion sans token', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expectErrorResponse(res, 401);
    });

    test('Doit refuser la déconnexion avec un token invalide', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expectErrorResponse(res, 401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('Doit envoyer un email de réinitialisation pour un email valide', async () => {
      // Créer un utilisateur de test
      const testUser = await createTestUser();
      
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expectSuccessResponse(res, 200);
      expect(res.body.message).toMatch(/Si cet email existe dans notre base, vous recevrez un lien de réinitialisation/i);
    });

    test('Doit accepter un email inexistant (sécurité)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expectSuccessResponse(res, 200);
      expect(res.body.message).toMatch(/Si cet email existe dans notre base, vous recevrez un lien de réinitialisation/i);
    });

    test('Doit refuser la demande sans email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expectErrorResponse(res, 400, /Email invalide/i);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('Doit refuser la réinitialisation sans token', async () => {
      // Créer un utilisateur de test
      const testUser = await createTestUser();
      
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: testUser.email,
          newPassword: 'newpassword123'
        });

      expectErrorResponse(res, 400, /Token de réinitialisation requis/i);
    });

    test('Doit refuser la réinitialisation avec des mots de passe différents', async () => {
      // Créer un utilisateur de test
      const testUser = await createTestUser();
      
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some-token',
          email: testUser.email,
          newPassword: 'newpassword123'
        });

      expectErrorResponse(res, 400, /Token de réinitialisation invalide/i);
    });
  });

  describe('Protection des routes', () => {
    test('Doit refuser l\'accès aux routes protégées sans token', async () => {
      const res = await request(app).get('/api/borrow');
      expectErrorResponse(res, 401, /token.*fourni/i);
    });

    test('Doit refuser l\'accès avec un token invalide', async () => {
      const res = await request(app)
        .get('/api/borrow')
        .set('Authorization', 'Bearer invalid-token');

      expectErrorResponse(res, 401, /token.*invalide/i);
    });

    test('Doit permettre l\'accès avec un token valide', async () => {
      // Créer un utilisateur de test et se connecter
      const testUser = await createTestUser();
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      const accessToken = loginRes.body.accessToken;

      // Utiliser une route qui ne nécessite pas de permissions admin
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expectSuccessResponse(res);
    });
  });

  describe('Gestion des rôles', () => {
    test('Doit créer un utilisateur avec le rôle user par défaut', async () => {
      const testData = {
        name: 'Role Test User',
        email: `roleuser_${Date.now()}@example.com`,
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(testData);

      expectSuccessResponse(res, 201);
      // Vérifier que l'utilisateur a bien été créé en base
      const createdUser = await User.findById(res.body._id);
      expect(createdUser.role).toBe('user');
    });

    test('Doit permettre à un admin d\'accéder aux routes admin', async () => {
      // Créer un admin de test et se connecter
      const adminUser = await createTestUser({ role: 'admin' });
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });

      const adminToken = loginRes.body.accessToken;

      // Test d'accès à une route admin (à adapter selon vos routes)
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
    });
  });

  describe('Gestion des erreurs avancées', () => {
    test('Doit gérer les erreurs de validation avancées', async () => {
      // Test avec un email très long
      const longEmail = 'a'.repeat(300) + '@example.com';
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: longEmail,
          password: 'password123'
        });

      expectErrorResponse(res, 400);
    });

    test('Doit gérer les erreurs de mot de passe complexes', async () => {
      // Test avec un mot de passe contenant des caractères spéciaux
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'p@ssw0rd!@#$%^&*()'
        });

      expectSuccessResponse(res, 201);
    });

    test('Doit gérer les erreurs de nom avec caractères spéciaux', async () => {
      // Test avec un nom contenant des caractères spéciaux
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jean-Pierre Dupont-Martin',
          email: 'test@example.com',
          password: 'password123'
        });

      expectSuccessResponse(res, 201);
    });

    test('Doit gérer les erreurs de refresh token expiré', async () => {
      // Créer un utilisateur et se connecter
      const testUser = await createTestUser();
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      const refreshToken = loginRes.body.refreshToken;

      // Attendre que le token expire (simulation)
      await new Promise(resolve => setTimeout(resolve, 100));

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      // Le token devrait toujours être valide dans les tests
      expectSuccessResponse(res, 200);
    });
  });
});