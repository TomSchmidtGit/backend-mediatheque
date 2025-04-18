import request from 'supertest';
import { app, server } from '../server.js';

describe('Borrow Routes', () => {
    let userToken;
    let mediaId;
    let borrowId;

    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        userToken = loginRes.body.token;
        expect(userToken).toBeDefined();

        const mediaRes = await request(app).get('/api/media');
        expect(Array.isArray(mediaRes.body.data)).toBe(true);
        expect(mediaRes.body.data.length).toBeGreaterThan(0);
        mediaId = mediaRes.body.data[0]._id;
        expect(mediaId).toBeDefined();

    });

    test('Doit emprunter un média', async () => {
        const res = await request(app)
            .post('/api/borrow')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                user: '67a34674e1fc0ef2b5b5e74d', // ID Admin
                media: mediaId
            });

        console.log("Borrow Response:", res.body);

        expect(res.statusCode).toBe(201);
        borrowId = res.body._id;
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

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Token expiré ou révoqué');
    });

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
    });
});