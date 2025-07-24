import request from 'supertest';
import { app, server } from '../server.js';
import fs from 'fs';

describe('Media Routes', () => {
    let token;
    let userToken;
    let mediaId;
    const testEmail = `testuser_${Date.now()}_${Math.floor(Math.random()*10000)}@example.com`;
    const testPassword = 'password123';

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'admin'
            });

        token = adminLogin.body.accessToken;
        expect(token).toBeDefined();

        const userRegister = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: testEmail,
                password: testPassword
            });

        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: testEmail,
                password: testPassword
            });

        userToken = userLogin.body.accessToken;
        expect(userToken).toBeDefined();
    });

    test('Ajouter un nouveau média avec image, catégorie et tags', async () => {
        const timestamp = Date.now();

        const categoryRes = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `Science-fiction ${timestamp}` });

        expect(categoryRes.statusCode).toBe(201);
        const categoryId = categoryRes.body._id;

        const tagRes1 = await request(app)
            .post('/api/tags')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `Tag 1 - ${timestamp}` });

        const tagRes2 = await request(app)
            .post('/api/tags')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `Tag 2 - ${timestamp}` });

        expect(tagRes1.statusCode).toBe(201);
        expect(tagRes2.statusCode).toBe(201);
        const tagIds = [tagRes1.body._id, tagRes2.body._id];

        const res = await request(app)
            .post('/api/media')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'The Matrix')
            .field('type', 'movie')
            .field('author', 'Wachowski Sisters')
            .field('year', 1999)
            .field('description', 'Un film culte !')
            .field('category', categoryId)
            .field('tags', tagIds[0])
            .field('tags', tagIds[1])
            .attach('image', 'tests/files/test-image.jpg');

        console.log("Response from media creation:", res.body);

        expect(res.statusCode).toBe(201);
        expect(res.body._id).toBeDefined();
        expect(res.body.category).toBe(categoryId);
        expect(res.body.tags).toEqual(expect.arrayContaining(tagIds));

        mediaId = res.body._id;
    });

    test('Uploader une image seule', async () => {
        const res = await request(app)
            .post('/api/media')
            .set('Authorization', `Bearer ${token}`)
            .attach('image', 'tests/files/test-image.jpg');

        console.log("Réponse de l'upload seul:", res.body);
    });

    test('Récupérer tous les médias', async () => {
        const res = await request(app).get('/api/media');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('Rechercher un média par mot-clé', async () => {
        expect(mediaId).toBeDefined();
    
        const res = await request(app)
            .get('/api/media')
            .query({ search: 'matrix' });
    
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    
        const found = res.body.data.find(m => m._id === mediaId);
        expect(found).toBeDefined();
        expect(found.title.toLowerCase()).toContain('matrix');
    });    

    test('Filtrer les médias par type, catégorie et tags', async () => {
        expect(mediaId).toBeDefined();
    
        const resMedia = await request(app).get(`/api/media/${mediaId}`);
        expect(resMedia.statusCode).toBe(200);
        const media = resMedia.body;
    
        const tagIds = media.tags.map(tag => tag.toString());
        const categoryId = media.category;
    
        const res = await request(app)
            .get('/api/media')
            .query({
                type: media.type,
                category: categoryId,
                tags: tagIds.join(',')
            });
    
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.find(m => m._id === mediaId)).toBeDefined();
    });    

    test('Récupérer un média par ID', async () => {
        expect(mediaId).toBeDefined();

        const res = await request(app).get(`/api/media/${mediaId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(mediaId);
    });

    test('Ajouter un avis sur un média', async () => {
        expect(mediaId).toBeDefined();

        const res = await request(app)
            .post(`/api/media/${mediaId}/reviews`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                rating: 5,
                comment: 'Super film !'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.reviews.length).toBe(1);
    });

    test('Un utilisateur ne peut pas ajouter plusieurs avis sur le même média', async () => {
        expect(mediaId).toBeDefined();

        const res = await request(app)
            .post(`/api/media/${mediaId}/reviews`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                rating: 3,
                comment: 'Je change mon avis'
            });

        expect(res.statusCode).toBe(400);
    });

    test('Modifier un avis existant', async () => {
        expect(mediaId).toBeDefined();

        const res = await request(app)
            .put(`/api/media/${mediaId}/reviews`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                rating: 4,
                comment: 'Finalement, un peu long...'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.reviews[0].rating).toBe(4);
    });

    test('Modifier un média existant', async () => {
        expect(mediaId).toBeDefined();
    
        const res = await request(app)
            .put(`/api/media/${mediaId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'The Matrix Remastered',
                description: 'Version restaurée 4K',
                category: null,
                tags: []
            });
    
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('The Matrix Remastered');
        expect(res.body.description).toBe('Version restaurée 4K');
        expect(res.body.category).toBeNull();
        expect(res.body.tags).toEqual([]);
    });    

    test('Supprimer un média', async () => {
        expect(mediaId).toBeDefined();

        const res = await request(app)
            .delete(`/api/media/${mediaId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    test('Vérifier si l’image est bien envoyée seule', async () => {
        const res = await request(app)
            .post('/api/media/test-upload')
            .set('Authorization', `Bearer ${token}`)
            .attach('image', 'tests/files/test-image.jpg');

        console.log("Réponse de l'upload image seule :", res.body);
    });

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
    });
});