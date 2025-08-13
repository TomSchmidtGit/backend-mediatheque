import request from 'supertest';
import { app } from '../server.js';
import {
  createTestUser,
  createTestAdmin,
  createTestBorrow,
  createTestMedia,
  expectErrorResponse,
  expectSuccessResponse,
} from './utils/testHelpers.js';

describe('Borrow Routes', () => {
  describe('POST /api/borrow', () => {
    test('Doit créer un nouvel emprunt avec des données valides', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur et un média pour l'emprunt
      const user = await createTestUser();
      const media = await createTestMedia();

      const borrowData = {
        userId: user._id.toString(),
        mediaId: media._id.toString(),
      };

      const res = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(borrowData);

      expectSuccessResponse(res, 201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('media');
      expect(res.body).toHaveProperty('borrowDate');
      expect(res.body).toHaveProperty('dueDate');
      expect(res.body).toHaveProperty('status');
    });

    test("Doit refuser la création d'emprunt par un utilisateur non-admin", async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'password123',
      });
      const userToken = loginRes.body.accessToken;

      const borrowData = {
        userId: user._id.toString(),
        mediaId: '507f1f77bcf86cd799439011',
      };

      const res = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${userToken}`)
        .send(borrowData);

      expectErrorResponse(res, 403);
    });

    test('Doit refuser la création sans authentification', async () => {
      const borrowData = {
        userId: '507f1f77bcf86cd799439011',
        mediaId: '507f1f77bcf86cd799439012',
      };

      const res = await request(app).post('/api/borrow').send(borrowData);
      expectErrorResponse(res, 401);
    });

    test('Doit valider les données obligatoires', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Test sans utilisateur
      const res1 = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ mediaId: '507f1f77bcf86cd799439011' });

      expectErrorResponse(res1, 400);

      // Test sans média
      const res2 = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: '507f1f77bcf86cd799439011' });

      expectErrorResponse(res2, 400);
    });

    test('Doit refuser la création pour un utilisateur inexistant', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      const media = await createTestMedia();

      const borrowData = {
        userId: '507f1f77bcf86cd799439011', // ID inexistant
        mediaId: media._id.toString(),
      };

      const res = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(borrowData);

      expectErrorResponse(res, 404);
    });

    test('Doit refuser la création pour un média inexistant', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      const user = await createTestUser();

      const borrowData = {
        userId: user._id.toString(),
        mediaId: '507f1f77bcf86cd799439011', // ID inexistant
      };

      const res = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(borrowData);

      expectErrorResponse(res, 404);
    });
  });

  describe('PUT /api/borrow/:id/return', () => {
    test('Doit permettre de retourner un média emprunté', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'password123',
      });
      const userToken = loginRes.body.accessToken;

      // Créer un emprunt
      const { borrow } = await createTestBorrow();

      const res = await request(app)
        .put(`/api/borrow/${borrow._id}/return`)
        .set('Authorization', `Bearer ${userToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Media returned successfully');
    });

    test('Doit refuser le retour sans authentification', async () => {
      const { borrow } = await createTestBorrow();

      const res = await request(app).put(`/api/borrow/${borrow._id}/return`);

      expectErrorResponse(res, 401);
    });
  });

  describe('GET /api/borrow/mine', () => {
    test('Doit permettre à un utilisateur de voir ses propres emprunts', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'password123',
      });
      const userToken = loginRes.body.accessToken;

      // Créer quelques emprunts pour cet utilisateur
      await createTestBorrow({ user: user._id });
      await createTestBorrow({ user: user._id });

      const res = await request(app)
        .get('/api/borrow/mine')
        .set('Authorization', `Bearer ${userToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("Doit refuser l'accès sans authentification", async () => {
      const res = await request(app).get('/api/borrow/mine');
      expectErrorResponse(res, 401);
    });

    test('Doit supporter la pagination', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'password123',
      });
      const userToken = loginRes.body.accessToken;

      // Créer quelques emprunts
      await createTestBorrow({ user: user._id });
      await createTestBorrow({ user: user._id });

      const res = await request(app)
        .get('/api/borrow/mine?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/borrow', () => {
    test('Doit permettre à un admin de récupérer tous les emprunts', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Créer quelques emprunts
      await createTestBorrow();
      await createTestBorrow();

      const res = await request(app)
        .get('/api/borrow')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("Doit refuser l'accès pour un utilisateur non-admin", async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'password123',
      });
      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .get('/api/borrow')
        .set('Authorization', `Bearer ${userToken}`);

      expectErrorResponse(res, 403);
    });

    test("Doit refuser l'accès sans authentification", async () => {
      const res = await request(app).get('/api/borrow');
      expectErrorResponse(res, 401);
    });

    test('Doit supporter la pagination', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Créer quelques emprunts
      await createTestBorrow();
      await createTestBorrow();

      const res = await request(app)
        .get('/api/borrow?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('currentPage');
      expect(res.body).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/borrow/user/:userId', () => {
    test("Doit permettre à un admin de voir les emprunts d'un utilisateur", async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur et quelques emprunts
      const user = await createTestUser();
      await createTestBorrow({ user: user._id });
      await createTestBorrow({ user: user._id });

      const res = await request(app)
        .get(`/api/borrow/user/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("Doit refuser l'accès pour un utilisateur non-admin", async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'password123',
      });
      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .get(`/api/borrow/user/${user._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expectErrorResponse(res, 403);
    });

    test('Doit supporter la pagination', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur et quelques emprunts
      const user = await createTestUser();
      await createTestBorrow({ user: user._id });
      await createTestBorrow({ user: user._id });

      const res = await request(app)
        .get(`/api/borrow/user/${user._id}?page=1&limit=2`)
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('totalPages');
    });
  });

  describe('Gestion des erreurs avancées', () => {
    test('Doit gérer les erreurs de validation de dates complexes', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Créer un utilisateur et un média de test
      const user = await createTestUser();
      const media = await createTestMedia();

      // Test avec une date de retour dans le passé
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Hier
      const borrowData = {
        user: user._id,
        media: media._id,
        dueDate: pastDate,
      };

      const res = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(borrowData);

      expectErrorResponse(res, 400);
    });

    test('Doit gérer les erreurs de validation de données complexes', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Test avec des données invalides
      const borrowData = {
        user: 'invalid-user-id',
        media: 'invalid-media-id',
        dueDate: 'invalid-date',
      };

      const res = await request(app)
        .post('/api/borrow')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(borrowData);

      expectErrorResponse(res, 400);
    });

    test('Doit gérer les erreurs de retour de média non emprunté', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'password123',
      });
      const userToken = loginRes.body.accessToken;

      // Créer un média de test (non emprunté)
      const media = await createTestMedia();

      // Essayer de retourner un média non emprunté
      const res = await request(app)
        .put(`/api/borrow/${media._id}/return`)
        .set('Authorization', `Bearer ${userToken}`);

      // L'API retourne 404 pour un emprunt inexistant
      expectErrorResponse(res, 404);
    });

    test('Doit gérer les erreurs de pagination invalide', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Test avec des paramètres de pagination invalides
      const res = await request(app)
        .get('/api/borrow?page=-1&limit=0')
        .set('Authorization', `Bearer ${adminToken}`);

      // L'API gère les paramètres invalides en utilisant des valeurs par défaut
      expectSuccessResponse(res, 200);
    });
  });
});
