import request from 'supertest';
import { app, server } from '../server.js';

describe('Tag Routes', () => {
    let token;
    let tagId;

    beforeAll(async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'admin'
            });

        token = loginRes.body.accessToken;
        expect(token).toBeDefined();
    });

    test('Créer un tag', async () => {
        const res = await request(app)
            .post('/api/tags')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `Adapté au cinéma ${Date.now()}` });

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toMatch(/Adapté au cinéma/);
        tagId = res.body._id;
    });

    test('Obtenir tous les tags', async () => {
        const res = await request(app).get('/api/tags');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('Modifier un tag', async () => {
        const newName = `Modifié ${Date.now()}`;
        const res = await request(app)
            .put(`/api/tags/${tagId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: newName });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe(newName);
    });

    test('Supprimer un tag', async () => {
        const res = await request(app)
            .delete(`/api/tags/${tagId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/supprimé/i);
    });

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
    });
});