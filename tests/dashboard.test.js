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

describe('Dashboard Routes', () => {
  describe('GET /api/dashboard/stats', () => {
    test('Doit permettre à un admin de récupérer les statistiques globales', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Créer quelques données de test pour avoir des statistiques
      await createTestBorrow();
      await createTestBorrow();
      await createTestMedia();

      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('media');
      expect(res.body).toHaveProperty('borrows');
    });

    test("Doit refuser l'accès aux statistiques pour un utilisateur non-admin", async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'password123',
      });
      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expectErrorResponse(res, 403);
    });

    test("Doit refuser l'accès sans authentification", async () => {
      const res = await request(app).get('/api/dashboard/stats');
      expectErrorResponse(res, 401);
    });
  });

  describe('GET /api/dashboard/borrows/stats', () => {
    test("Doit permettre à un admin de récupérer les statistiques d'emprunts par période", async () => {
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
        .get('/api/dashboard/borrows/stats?period=month')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('period');
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
        .get('/api/dashboard/borrows/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expectErrorResponse(res, 403);
    });
  });

  describe('GET /api/dashboard/media/categories', () => {
    test('Doit permettre à un admin de récupérer les statistiques des médias par catégorie', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'password123',
      });
      const adminToken = loginRes.body.accessToken;

      // Créer quelques médias avec catégories
      await createTestMedia();
      await createTestMedia();

      const res = await request(app)
        .get('/api/dashboard/media/categories')
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(Array.isArray(res.body)).toBe(true);
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
        .get('/api/dashboard/media/categories')
        .set('Authorization', `Bearer ${userToken}`);

      expectErrorResponse(res, 403);
    });
  });
});
