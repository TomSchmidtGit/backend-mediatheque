import request from 'supertest';
import { app, server } from '../server.js';

describe('Auth Routes', () => {
    let token;

    test('Doit créer un nouvel utilisateur', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: `testuser${Date.now()}@example.com`, // Email unique
                password: 'password123'
            });

        console.log("Register Response:", res.body); // Debug

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
    });

    test('Doit se connecter et recevoir un token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        token = res.body.token;
        expect(res.statusCode).toBe(200);
        expect(token).toBeDefined();
    });

    test('Doit se déconnecter et invalider le token', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

        console.log("Logout Response:", res.body); // Debug

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Déconnexion réussie');
    });

    test('Ne doit plus accéder aux routes protégées après déconnexion', async () => {
        const res = await request(app)
            .get('/api/borrow')
            .set('Authorization', `Bearer ${token}`);
    
        console.log("Access after Logout Response:", res.body); // Debug
    
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Token expiré ou révoqué');
    });    

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
    });
});