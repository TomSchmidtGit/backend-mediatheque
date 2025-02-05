import request from 'supertest';
import { app, server } from '../server.js';

describe('User Routes', () => {
    let adminToken;
    let userToken;
    let userId;

    beforeAll(async () => {
        // ✅ Connexion en tant qu'admin
        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com', // 📌 Vérifie que cet utilisateur existe en base !
                password: 'admin'
            });

        expect(adminLoginRes.statusCode).toBe(200);
        adminToken = adminLoginRes.body.token;
        expect(adminToken).toBeDefined();

        // ✅ Création d'un utilisateur normal
        const userRegisterRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'User Test',
                email: `usertest${Date.now()}@example.com`,
                password: 'password123'
            });

        expect(userRegisterRes.statusCode).toBe(201);
        userId = userRegisterRes.body._id;

        // ✅ Connexion en tant qu'utilisateur normal
        const userLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: userRegisterRes.body.email,
                password: 'password123'
            });

        expect(userLoginRes.statusCode).toBe(200);
        userToken = userLoginRes.body.token;
        expect(userToken).toBeDefined();
    });

    test('Un admin peut modifier un utilisateur', async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Updated User',
                role: 'employee' // ✅ Un admin peut modifier le rôle
            });

        console.log("Admin Update User Response:", res.body); // 🔍 Debug

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Updated User');
        expect(res.body.role).toBe('employee');
    });

    test('Un utilisateur normal ne peut pas modifier un autre utilisateur', async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name: 'Hacker Attempt'
            });

        console.log("User Unauthorized Update Attempt:", res.body); // 🔍 Debug

        expect(res.statusCode).toBe(403); // ❌ Doit être refusé
        expect(res.body.message).toBe('Accès interdit');
    });

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
    });
});