import request from 'supertest';
import { app, server } from '../server.js';

describe('Media Routes', () => {
    let token;

    beforeAll(async () => {
        // ✅ Vérifier que l'admin peut se connecter
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com', // 📌 Vérifie que cet utilisateur existe en base !
                password: 'admin'
            });

        console.log("Login Admin Response:", res.body); // 🔍 Debug

        token = res.body.token;
        expect(token).toBeDefined(); // ✅ Vérifie que le token est bien récupéré
    });

    test('Doit ajouter un nouveau média', async () => {
        const res = await request(app)
            .post('/api/media')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'The Matrix',
                type: 'movie',
                author: 'Wachowski Sisters',
                year: 1999
            });

        console.log("Create Media Response:", res.body); // 🔍 Debug

        expect(res.statusCode).toBe(201);
    });

    test('Doit récupérer tous les médias', async () => {
        const res = await request(app).get('/api/media');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('Doit se déconnecter et invalider le token', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    test('Ne doit plus pouvoir ajouter un média après déconnexion', async () => {
        const res = await request(app)
            .post('/api/media')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Another Movie',
                type: 'movie',
                author: 'Director',
                year: 2020
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