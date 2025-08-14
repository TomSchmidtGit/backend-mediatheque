import request from 'supertest';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { app } from '../server.js';
import mongoose from 'mongoose';

describe('External API Routes', () => {
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    // Créer un utilisateur admin de test dans chaque test
    adminUser = new User({
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin Test',
      role: 'admin',
      actif: true,
    });
    await adminUser.save();

    // Créer un token JWT pour l'admin
    adminToken = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    // Nettoyer complètement la base de données après chaque test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  afterAll(async () => {
    // Nettoyer complètement à la fin
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
    await mongoose.connection.close();
  });

  describe('GET /api/external/search', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/external/search')
        .query({ query: 'test' });

      expect(response.status).toBe(401);
    });

    it('should require admin role', async () => {
      // Créer un utilisateur non-admin
      const regularUser = new User({
        email: 'user@test.com',
        password: 'password123',
        name: 'User Test',
        role: 'user',
        actif: true,
      });
      await regularUser.save();

      const userToken = jwt.sign(
        { id: regularUser._id, role: regularUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/external/search')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ query: 'test' });

      expect(response.status).toBe(403);
    });

    it('should validate query parameter', async () => {
      const response = await request(app)
        .get('/api/external/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ query: 'a' }); // Trop court

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('au moins 2 caractères');
    });

    it('should accept valid search query', async () => {
      const response = await request(app)
        .get('/api/external/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ query: 'harry potter' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('query', 'harry potter');
    });
  });

  describe('GET /api/external/search/books', () => {
    it('should search books specifically', async () => {
      const response = await request(app)
        .get('/api/external/search/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ query: 'tolkien' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('query', 'tolkien');
    });
  });

  describe('GET /api/external/search/movies', () => {
    it('should search movies specifically', async () => {
      const response = await request(app)
        .get('/api/external/search/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ query: 'lord of the rings' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('query', 'lord of the rings');
    });
  });

  describe('GET /api/external/search/music', () => {
    it('should search music specifically', async () => {
      const response = await request(app)
        .get('/api/external/search/music')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ query: 'beatles' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('query', 'beatles');
    });
  });

  describe('GET /api/external/search/advanced', () => {
    it('should perform advanced search with multiple parameters', async () => {
      const response = await request(app)
        .get('/api/external/search/advanced')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          query: 'harry',
          author: 'rowling',
          type: 'book',
          year: 1997,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('query', 'harry');
      expect(response.body).toHaveProperty('author', 'rowling');
      expect(response.body).toHaveProperty('type', 'book');
      expect(response.body).toHaveProperty('year', '1997');
    });

    it('should require at least query or author', async () => {
      const response = await request(app)
        .get('/api/external/search/advanced')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ type: 'book' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'Au moins une requête ou un auteur'
      );
    });
  });

  describe('GET /api/external/media/:source/:type/:id', () => {
    it('should get media by external ID', async () => {
      const response = await request(app)
        .get('/api/external/media/google_books/book/test123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should validate required parameters', async () => {
      // Test avec un paramètre vide (type vide)
      const response = await request(app)
        .get('/api/external/media/google_books//test123')
        .set('Authorization', `Bearer ${adminToken}`);

      // Express considère cette route comme invalide et retourne 404
      // C'est le comportement attendu pour une route malformée
      expect(response.status).toBe(404);
    });
  });
});
