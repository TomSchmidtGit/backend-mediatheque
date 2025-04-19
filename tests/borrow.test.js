import request from 'supertest';
import { app, server } from '../server.js';
import path from 'path';

describe('Borrow Routes', () => {
    let userToken;
    let adminToken;
    let mediaId;
    let borrowId;

    beforeAll(async () => {
        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'admin'
            });

        adminToken = adminLoginRes.body.token;
        expect(adminToken).toBeDefined();

        const userLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        userToken = userLoginRes.body.token;
        expect(userToken).toBeDefined();

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
                user: '67a34674e1fc0ef2b5b5e74d',
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

    test('Doit se déconnecter et invalider le token', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
    });

    test('Ne doit plus pouvoir emprunter un média après déconnexion', async () => {
        const res = await request(app)
            .post('/api/borrow')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                user: '67a34674e1fc0ef2b5b5e74d',
                media: mediaId
            });

        console.log('❌ Erreur après logout:', res.body);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Token expiré ou révoqué');
    });

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
    });
});