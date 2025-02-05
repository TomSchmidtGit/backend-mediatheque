import request from 'supertest';
import app from '../server.js';

describe('Auth Routes', () => {
    let token;

    test('Doit créer un nouvel utilisateur', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: `testuser${Date.now()}@example.com`, // ✅ Email unique
                password: 'password123'
            });

        console.log("Register Response:", res.body); // 🔍 Debug

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
});