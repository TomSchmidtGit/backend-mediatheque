import request from 'supertest';
import app from '../server.js';

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
});