import request from 'supertest';
import { app, server } from '../server.js';

describe('Category Routes', () => {
    let token;
    let categoryId;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'admin'
            });

        token = adminLogin.body.accessToken;
        expect(token).toBeDefined();
    });

    test('Créer une catégorie', async () => {
        const res = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Fantastique' });

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('Fantastique');
        categoryId = res.body._id;
    });

    test('Obtenir toutes les catégories', async () => {
        const res = await request(app).get('/api/categories');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('Mettre à jour une catégorie', async () => {
        const res = await request(app)
            .put(`/api/categories/${categoryId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Fantasy' });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Fantasy');
    });

    test('Supprimer une catégorie', async () => {
        const res = await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/supprimée/i);
    });

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
    });
});