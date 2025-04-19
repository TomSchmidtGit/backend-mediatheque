import request from 'supertest';
import { app, server } from '../server.js';
import path from 'path';

describe('Borrow Routes', () => {
    let userToken;
    let adminToken;
    let userId;
    let mediaId;
    let borrowId;

    beforeAll(async () => {
        // Connexion admin
        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'admin'
            });

        adminToken = adminLoginRes.body.accessToken;
        expect(adminToken).toBeDefined();

        // Connexion utilisateur
        const userLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        userToken = userLoginRes.body.accessToken;
        userId = userLoginRes.body._id;
        expect(userToken).toBeDefined();

        // Création d'un média à emprunter
        const createMediaRes = await request(app)
            .post('/api/media')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('title', 'Media de test emprunt')
            .field('type', 'book')
            .field('author', 'Test Author')
            .field('year', 2025)
            .field('description', 'Média temporaire')
            .attach('image', 'tests/files/test-image.jpg');

        mediaId = createMediaRes.body._id;
        expect(mediaId).toBeDefined();
    });

    test('Doit emprunter un média', async () => {
        const res = await request(app)
            .post('/api/borrow')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                user: userId,
                media: mediaId
            });

        console.log("Borrow Response:", res.body);
        expect(res.statusCode).toBe(201);
        borrowId = res.body._id;
        expect(borrowId).toBeDefined();
    });

    test('Doit retourner un média', async () => {
        const res = await request(app)
            .put(`/api/borrow/${borrowId}/return`)
            .set('Authorization', `Bearer ${userToken}`);

        console.log("Return Response:", res.body);
        expect(res.statusCode).toBe(200);
    });

    test('Un admin peut voir tous les emprunts avec pagination', async () => {
        const res = await request(app)
            .get('/api/borrow?page=1&limit=5')
            .set('Authorization', `Bearer ${adminToken}`);
    
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('totalBorrows');
    });

    test('Un admin peut voir les emprunts d’un utilisateur avec pagination', async () => {
        const res = await request(app)
            .get(`/api/borrow/user/${userId}?page=1&limit=5`)
            .set('Authorization', `Bearer ${adminToken}`);
    
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.page).toBe(1);
    });

    test('Un utilisateur peut voir ses emprunts avec pagination', async () => {
        const res = await request(app)
            .get('/api/borrow/mine?page=1&limit=5')
            .set('Authorization', `Bearer ${userToken}`);
    
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.page).toBe(1);
    });

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
    });
});