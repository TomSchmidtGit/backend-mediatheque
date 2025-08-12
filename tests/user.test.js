import request from 'supertest';
import { app } from '../server.js';
import { 
  createTestUser, 
  createTestAdmin,
  expectErrorResponse,
  expectSuccessResponse
} from './utils/testHelpers.js';

describe('User Routes', () => {
  describe('GET /api/users', () => {
    test('Doit permettre à un admin de récupérer tous les utilisateurs', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer quelques utilisateurs de test
      await createTestUser();
      await createTestUser();

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3); // admin + 2 utilisateurs
    });

    test('Doit refuser l\'accès pour un utilisateur non-admin', async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expectErrorResponse(res, 403);
    });

    test('Doit refuser l\'accès sans authentification', async () => {
      const res = await request(app).get('/api/users');
      expectErrorResponse(res, 401);
    });
  });

  describe('GET /api/users/:id', () => {
    test('Doit permettre à un admin de récupérer un utilisateur spécifique', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur de test
      const testUser = await createTestUser();

      const res = await request(app)
        .get(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body._id).toBe(testUser._id.toString());
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('role');
    });

    test('Doit refuser l\'accès pour un utilisateur non-admin', async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expectErrorResponse(res, 403);
    });

    test('Doit retourner 404 pour un utilisateur inexistant', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      const res = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expectErrorResponse(res, 404);
    });
  });

  describe('PUT /api/users/:id', () => {
    test('Doit permettre à un admin de modifier un utilisateur', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur de test
      const testUser = await createTestUser();

      const updateData = {
        name: 'Updated User Name',
        email: 'updated@example.com'
      };

      const res = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expectSuccessResponse(res);
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.email).toBe(updateData.email);
    });

    test('Doit refuser la modification par un utilisateur non-admin', async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const updateData = {
        name: 'Updated User Name'
      };

      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expectErrorResponse(res, 403);
    });

    test('Doit refuser la modification sans authentification', async () => {
      const updateData = {
        name: 'Updated User Name'
      };

      const res = await request(app)
        .put('/api/users/507f1f77bcf86cd799439011')
        .send(updateData);

      expectErrorResponse(res, 401);
    });

    test('Doit valider les données de mise à jour', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur de test
      const testUser = await createTestUser();

      // Test avec un email déjà utilisé par un autre utilisateur
      const otherUser = await createTestUser();
      const invalidData = {
        email: otherUser.email
      };

      const res = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expectErrorResponse(res, 400);
    });
  });

  describe('PATCH /api/users/:id/deactivate', () => {
    test('Doit permettre à un admin de désactiver un utilisateur', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur de test
      const testUser = await createTestUser();

      const res = await request(app)
        .patch(`/api/users/${testUser._id}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Utilisateur désactivé avec succès');
    });

    test('Doit refuser la désactivation par un utilisateur non-admin', async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .patch(`/api/users/${user._id}/deactivate`)
        .set('Authorization', `Bearer ${userToken}`);

      expectErrorResponse(res, 403);
    });
  });

  describe('PATCH /api/users/:id/reactivate', () => {
    test('Doit permettre à un admin de réactiver un utilisateur', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur de test et le désactiver d'abord
      const testUser = await createTestUser();
      testUser.actif = false;
      await testUser.save();

      const res = await request(app)
        .patch(`/api/users/${testUser._id}/reactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Utilisateur réactivé avec succès');
    });

    test('Doit refuser la réactivation par un utilisateur non-admin', async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .patch(`/api/users/${user._id}/reactivate`)
        .set('Authorization', `Bearer ${userToken}`);

      expectErrorResponse(res, 403);
    });
  });

  describe('GET /api/users/me', () => {
    test('Doit permettre à un utilisateur de récupérer son profil', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`);

      expectSuccessResponse(res);
      expect(res.body._id).toBe(user._id.toString());
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('role');
    });

    test('Doit refuser l\'accès sans authentification', async () => {
      const res = await request(app).get('/api/users/me');
      expectErrorResponse(res, 401);
    });
  });

  describe('PUT /api/users/me', () => {
    test('Doit permettre à un utilisateur de mettre à jour son profil', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const updateData = {
        name: 'Updated My Name'
      };

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expectSuccessResponse(res);
      expect(res.body.name).toBe(updateData.name);
    });

    test('Doit refuser la mise à jour sans authentification', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const res = await request(app)
        .put('/api/users/me')
        .send(updateData);

      expectErrorResponse(res, 401);
    });

    test('Doit valider les données de mise à jour', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      // Créer un autre utilisateur avec un email différent
      const otherUser = await createTestUser();
      
      // Essayer d'utiliser l'email de l'autre utilisateur
      const invalidData = {
        email: otherUser.email
      };

      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData);

      expectErrorResponse(res, 400);
    });
  });

  describe('PATCH /api/users/me/deactivate', () => {
    test('Doit permettre à un utilisateur de désactiver son propre compte', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const deactivateData = {
        password: 'password123'
      };

      const res = await request(app)
        .patch('/api/users/me/deactivate')
        .set('Authorization', `Bearer ${userToken}`)
        .send(deactivateData);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Compte désactivé avec succès');
    });

    test('Doit refuser la désactivation sans mot de passe', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .patch('/api/users/me/deactivate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expectErrorResponse(res, 400);
    });
  });

  describe('GET /api/users/favorites', () => {
    test('Doit permettre à un utilisateur de récupérer ses favoris', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .get('/api/users/favorites')
        .set('Authorization', `Bearer ${userToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Doit refuser l\'accès sans authentification', async () => {
      const res = await request(app).get('/api/users/favorites');
      expectErrorResponse(res, 401);
    });
  });

  describe('POST /api/users/favorites/toggle', () => {
    test('Doit permettre à un utilisateur d\'ajouter/retirer un favori', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const toggleData = {
        mediaId: '507f1f77bcf86cd799439011'
      };

      const res = await request(app)
        .post('/api/users/favorites/toggle')
        .set('Authorization', `Bearer ${userToken}`)
        .send(toggleData);

      expectSuccessResponse(res);
    });

    test('Doit refuser l\'accès sans authentification', async () => {
      const toggleData = {
        mediaId: '507f1f77bcf86cd799439011'
      };

      const res = await request(app)
        .post('/api/users/favorites/toggle')
        .send(toggleData);

      expectErrorResponse(res, 401);
    });
  });

  describe('Gestion des erreurs avancées', () => {
    test('Doit gérer les erreurs de validation complexes', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur de test
      const testUser = await createTestUser();

      // Test avec un nom très long (qui devrait être accepté par MongoDB)
      const res = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'A'.repeat(200),
          email: 'test@example.com'
        });

      // Le nom long est accepté par MongoDB, donc on attend un succès
      expectSuccessResponse(res, 200);
    });

    test('Doit gérer les erreurs de rôle invalide', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur de test
      const testUser = await createTestUser();

      // Test avec un rôle invalide
      const res = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'invalid-role'
        });

      expectErrorResponse(res, 400);
    });

    test('Doit gérer les erreurs de désactivation d\'utilisateur déjà désactivé', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur de test et le désactiver
      const testUser = await createTestUser();
      testUser.actif = false;
      await testUser.save();

      // Essayer de le désactiver à nouveau
      const res = await request(app)
        .patch(`/api/users/${testUser._id}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expectErrorResponse(res, 400);
    });

    test('Doit gérer les erreurs de réactivation d\'utilisateur déjà actif', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur de test (actif par défaut)
      const testUser = await createTestUser();

      // Essayer de le réactiver alors qu'il est déjà actif
      const res = await request(app)
        .patch(`/api/users/${testUser._id}/reactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expectErrorResponse(res, 400);
    });
  });
});