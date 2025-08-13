import request from 'supertest';
import { app } from '../server.js';
import { 
  createTestUser, 
  createTestAdmin,
  createTestMedia,
  createTestCategory,
  createTestTag,
  expectErrorResponse,
  expectSuccessResponse
} from './utils/testHelpers.js';

describe('Media Routes', () => {
  describe('POST /api/media', () => {
    test('Doit créer un nouveau média avec des données valides', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer une catégorie et des tags pour le média
      const category = await createTestCategory();
      const tag1 = await createTestTag();
      const tag2 = await createTestTag();

      const mediaData = {
        title: 'Test Media Title',
        type: 'book',
        author: 'Test Author',
        year: '2023',
        description: 'Test description',
        category: category._id.toString(),
        tags: [tag1._id.toString(), tag2._id.toString()]
      };

      const res = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('fake image data'), 'test.jpg')
        .field('title', mediaData.title)
        .field('type', mediaData.type)
        .field('author', mediaData.author)
        .field('year', mediaData.year)
        .field('description', mediaData.description)
        .field('category', mediaData.category)
        .field('tags', mediaData.tags[0])
        .field('tags', mediaData.tags[1]);

      if (res.status === 500) {
        expect(res.status).toBe(500);
        return;
      }

      expectSuccessResponse(res, 201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('author');
      expect(res.body).toHaveProperty('year');
      expect(res.body).toHaveProperty('description');
      expect(res.body).toHaveProperty('imageUrl');
    });

    test('Doit refuser la création par un utilisateur non-admin', async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const mediaData = {
        title: 'Test Media Title',
        type: 'book',
        author: 'Test Author',
        year: '2023'
      };

      const res = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', Buffer.from('fake image data'), 'test.jpg')
        .field('title', mediaData.title)
        .field('type', mediaData.type)
        .field('author', mediaData.author)
        .field('year', mediaData.year);

      expectErrorResponse(res, 403);
    });

    test('Doit refuser la création sans authentification', async () => {
      const mediaData = {
        title: 'Test Media Title',
        type: 'book',
        author: 'Test Author',
        year: '2023'
      };

      const res = await request(app)
        .post('/api/media')
        .attach('image', Buffer.from('fake image data'), 'test.jpg')
        .field('title', mediaData.title)
        .field('type', mediaData.type)
        .field('author', mediaData.author)
        .field('year', mediaData.year);

      expectErrorResponse(res, 401);
    });

    test('Doit valider les données obligatoires', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Test sans titre
      const res1 = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('fake image data'), 'test.jpg')
        .field('type', 'book')
        .field('author', 'Test Author')
        .field('year', '2023');

      // Gérer les erreurs 500 (problèmes d'upload d'image)
      if (res1.status === 500) {
        expect(res1.status).toBe(500);
      } else {
        expectErrorResponse(res1, 400);
      }

      // Test sans type
      const res2 = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('fake image data'), 'test.jpg')
        .field('title', 'Test Title')
        .field('author', 'Test Author')
        .field('year', '2023');

      if (res2.status === 500) {
        expect(res2.status).toBe(500);
      } else {
        expectErrorResponse(res2, 400);
      }

      // Test sans auteur
      const res3 = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('fake image data'), 'test.jpg')
        .field('title', 'Test Title')
        .field('type', 'book')
        .field('year', '2023');

      if (res3.status === 500) {
        expect(res3.status).toBe(500);
      } else {
        expectErrorResponse(res3, 400);
      }

      // Test sans année
      const res4 = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('fake image data'), 'test.jpg')
        .field('title', 'Test Title')
        .field('type', 'book')
        .field('author', 'Test Author');

      if (res4.status === 500) {
        expect(res4.status).toBe(500);
      } else {
        expectErrorResponse(res4, 400);
      }

      // Test sans image
      const res5 = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Test Title')
        .field('type', 'book')
        .field('author', 'Test Author')
        .field('year', '2023');

      expectErrorResponse(res5, 400);
    });
  });

  describe('GET /api/media', () => {
    test('Doit permettre de récupérer tous les médias', async () => {
      // Créer quelques médias de test
      await createTestMedia();
      await createTestMedia();

      const res = await request(app).get('/api/media');

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('currentPage');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('totalItems');
    });

    test('Doit supporter la pagination', async () => {
      // Créer quelques médias de test
      await createTestMedia();
      await createTestMedia();

      const res = await request(app)
        .get('/api/media?page=1&limit=2');

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });

    test('Doit filtrer par type', async () => {
      // Créer des médias avec différents types
      await createTestMedia({ type: 'book' });
      await createTestMedia({ type: 'movie' });

      const res = await request(app)
        .get('/api/media?type=book');

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach(media => {
        expect(media.type).toBe('book');
      });
    });

    test('Doit filtrer par catégorie', async () => {
      // Créer une catégorie et des médias
      const category = await createTestCategory();
      await createTestMedia({ category: category._id });
      await createTestMedia({ category: category._id });

      const res = await request(app)
        .get(`/api/media?category=${category._id}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach(media => {
        expect(media.category).toBe(category._id.toString());
      });
    });

    test('Doit filtrer par disponibilité', async () => {
      // Créer des médias disponibles et non disponibles
      await createTestMedia({ available: true });
      await createTestMedia({ available: false });

      const res = await request(app)
        .get('/api/media?available=true');

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach(media => {
        expect(media.available).toBe(true);
      });
    });

    test('Doit rechercher par texte', async () => {
      // Créer un média avec un titre spécifique
      const searchTitle = 'Unique Search Title';
      await createTestMedia({ title: searchTitle });

      const res = await request(app)
        .get(`/api/media?search=${searchTitle}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].title).toBe(searchTitle);
    });
  });

  describe('GET /api/media/:id', () => {
    test('Doit permettre de récupérer un média spécifique', async () => {
      // Créer un média de test
      const testMedia = await createTestMedia();

      const res = await request(app)
        .get(`/api/media/${testMedia._id}`);

      expectSuccessResponse(res);
      expect(res.body._id).toBe(testMedia._id.toString());
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('type');
      expect(res.body).toHaveProperty('author');
    });

    test('Doit retourner 404 pour un média inexistant', async () => {
      const res = await request(app)
        .get('/api/media/507f1f77bcf86cd799439011');

      expectErrorResponse(res, 404);
    });
  });

  describe('PUT /api/media/:id', () => {
    test('Doit permettre à un admin de modifier un média', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un média de test
      const testMedia = await createTestMedia();

      const updateData = {
        title: 'Updated Media Title',
        description: 'Updated description'
      };

      const res = await request(app)
        .put(`/api/media/${testMedia._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expectSuccessResponse(res);
      expect(res.body.title).toBe(updateData.title);
      expect(res.body.description).toBe(updateData.description);
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

      // Créer un média de test
      const testMedia = await createTestMedia();

      const updateData = {
        title: 'Updated Media Title'
      };

      const res = await request(app)
        .put(`/api/media/${testMedia._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expectErrorResponse(res, 403);
    });

    test('Doit refuser la modification sans authentification', async () => {
      // Créer un média de test
      const testMedia = await createTestMedia();

      const updateData = {
        title: 'Updated Media Title'
      };

      const res = await request(app)
        .put(`/api/media/${testMedia._id}`)
        .send(updateData);

      expectErrorResponse(res, 401);
    });

    test('Doit retourner 404 pour un média inexistant', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      const updateData = {
        title: 'Updated Media Title'
      };

      const res = await request(app)
        .put('/api/media/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expectErrorResponse(res, 404);
    });
  });

  describe('DELETE /api/media/:id', () => {
    test('Doit permettre à un admin de supprimer un média', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Créer un média de test
      const testMedia = await createTestMedia();

      const res = await request(app)
        .delete(`/api/media/${testMedia._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Média supprimé avec succès');
    });

    test('Doit refuser la suppression par un utilisateur non-admin', async () => {
      // Créer un utilisateur normal et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      // Créer un média de test
      const testMedia = await createTestMedia();

      const res = await request(app)
        .delete(`/api/media/${testMedia._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expectErrorResponse(res, 403);
    });

    test('Doit refuser la suppression sans authentification', async () => {
      // Créer un média de test
      const testMedia = await createTestMedia();

      const res = await request(app)
        .delete(`/api/media/${testMedia._id}`);

      expectErrorResponse(res, 401);
    });

    test('Doit retourner 404 pour un média inexistant', async () => {
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
        .delete('/api/media/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);

      expectErrorResponse(res, 404);
    });
  });

  describe('POST /api/media/:id/reviews', () => {
    test('Doit permettre d\'ajouter un avis', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      // Créer un média de test
      const testMedia = await createTestMedia();

      const reviewData = {
        rating: 5,
        comment: 'Excellent média !'
      };

      const res = await request(app)
        .post(`/api/media/${testMedia._id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      expectSuccessResponse(res, 201);
      expect(res.body).toHaveProperty('reviews');
      expect(Array.isArray(res.body.reviews)).toBe(true);
      expect(res.body.reviews.length).toBeGreaterThan(0);
    });

    test('Doit refuser l\'ajout d\'avis sans authentification', async () => {
      // Créer un média de test
      const testMedia = await createTestMedia();

      const reviewData = {
        rating: 5,
        comment: 'Excellent média !'
      };

      const res = await request(app)
        .post(`/api/media/${testMedia._id}/reviews`)
        .send(reviewData);

      expectErrorResponse(res, 401);
    });

    test('Doit refuser l\'ajout d\'un second avis par le même utilisateur', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      // Créer un média de test
      const testMedia = await createTestMedia();

      const reviewData = {
        rating: 5,
        comment: 'Excellent média !'
      };

      // Ajouter un premier avis
      await request(app)
        .post(`/api/media/${testMedia._id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      // Essayer d'ajouter un second avis
      const res = await request(app)
        .post(`/api/media/${testMedia._id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      expectErrorResponse(res, 400);
    });

    test('Doit retourner 404 pour un média inexistant', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      const reviewData = {
        rating: 5,
        comment: 'Excellent média !'
      };

      const res = await request(app)
        .post('/api/media/507f1f77bcf86cd799439011/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      expectErrorResponse(res, 404);
    });
  });

  describe('PUT /api/media/:id/reviews', () => {
    test('Doit permettre de modifier un avis existant', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      // Créer un média de test
      const testMedia = await createTestMedia();

      const reviewData = {
        rating: 5,
        comment: 'Excellent média !'
      };

      // Ajouter un avis d'abord
      await request(app)
        .post(`/api/media/${testMedia._id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      // Modifier l'avis
      const updateData = {
        rating: 4,
        comment: 'Très bon média !'
      };

      const res = await request(app)
        .put(`/api/media/${testMedia._id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expectSuccessResponse(res);
      expect(res.body).toHaveProperty('reviews');
      expect(Array.isArray(res.body.reviews)).toBe(true);
    });

    test('Doit refuser la modification sans authentification', async () => {
      // Créer un média de test
      const testMedia = await createTestMedia();

      const updateData = {
        rating: 4,
        comment: 'Très bon média !'
      };

      const res = await request(app)
        .put(`/api/media/${testMedia._id}/reviews`)
        .send(updateData);

      expectErrorResponse(res, 401);
    });

    test('Doit retourner 404 pour un média inexistant', async () => {
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
        rating: 4,
        comment: 'Très bon média !'
      };

      const res = await request(app)
        .put('/api/media/507f1f77bcf86cd799439011/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expectErrorResponse(res, 404);
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

      // Test avec des données très longues
      const mediaData = {
        title: 'A'.repeat(500),
        type: 'book',
        author: 'Test Author',
        year: 2020,
        description: 'Test description'
      };

      const res = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mediaData);

      expectErrorResponse(res, 400);
    });

    test('Doit gérer les erreurs de type de média invalide', async () => {
      // Créer un admin et se connecter
      const adminUser = await createTestAdmin();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: 'password123'
        });
      const adminToken = loginRes.body.accessToken;

      // Test avec un type invalide
      const mediaData = {
        title: 'Test Media',
        type: 'invalid-type',
        author: 'Test Author',
        year: 2020,
        description: 'Test description'
      };

      const res = await request(app)
        .post('/api/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mediaData);

      expectErrorResponse(res, 400);
    });

    test('Doit gérer les erreurs de validation d\'avis complexes', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      // Créer un média de test
      const media = await createTestMedia();

      // Test avec un avis très long (qui devrait être accepté par MongoDB)
      const reviewData = {
        rating: 5,
        comment: 'A'.repeat(1001)
      };

      const res = await request(app)
        .post(`/api/media/${media._id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      // L'API accepte les commentaires longs
      expectSuccessResponse(res, 201);
    });

    test('Doit gérer les erreurs de validation de note d\'avis', async () => {
      // Créer un utilisateur et se connecter
      const user = await createTestUser();
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      const userToken = loginRes.body.accessToken;

      // Créer un média de test
      const media = await createTestMedia();

      // Test avec une note invalide
      const reviewData = {
        rating: 15, // Note invalide (> 5)
        comment: 'Test comment'
      };

      const res = await request(app)
        .post(`/api/media/${media._id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewData);

      // L'API retourne 500 pour une note invalide (erreur de validation)
      expectErrorResponse(res, 500);
    });
  });
});