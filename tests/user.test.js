import request from 'supertest';
import { app, server } from '../server.js';
import mongoose from 'mongoose';

describe('User Routes', () => {
    let adminToken;
    let userToken;
    let userId;
    let mediaId;
    let userEmail;
    const testEmail = `testuser_${Date.now()}_${Math.floor(Math.random()*10000)}@example.com`;
    const testPassword = 'password123';

    beforeAll(async () => {
        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'admin'
            });

        expect(adminLoginRes.statusCode).toBe(200);
        adminToken = adminLoginRes.body.accessToken;
        expect(adminToken).toBeDefined();

        const userRegisterRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'User Test',
                email: testEmail,
                password: testPassword
            });

        userEmail = testEmail;

        expect(userRegisterRes.statusCode).toBe(201);
        userId = userRegisterRes.body._id;

        const userLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testEmail,
                password: testPassword
            });

        expect(userLoginRes.statusCode).toBe(200);
        userToken = userLoginRes.body.accessToken;
        expect(userToken).toBeDefined();

        // Création d'un média pour test
        const mediaRes = await request(app)
            .post('/api/media')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('title', 'Test Média Favori')
            .field('type', 'movie')
            .field('author', 'Auteur Favori')
            .field('year', 2023)
            .field('description', 'Description pour test favori')
            .attach('image', 'tests/files/test-image.jpg');

        expect(mediaRes.statusCode).toBe(201);
        mediaId = mediaRes.body._id;
        expect(mediaId).toBeDefined();
    }, 15000);

    test('Un admin peut récupérer la liste des utilisateurs', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test('Un utilisateur normal ne peut pas accéder à la liste des utilisateurs', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Accès interdit');
    });

    test('Un admin peut modifier un utilisateur', async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Updated User',
                role: 'employee'
            });

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

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Accès interdit');
    });

    test('Un utilisateur peut ajouter un média aux favoris', async () => {
        const res = await request(app)
            .post('/api/users/favorites/toggle')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ mediaId });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Média ajouté aux favoris');
    });

    test('Un utilisateur peut voir ses favoris avec pagination', async () => {
        const res = await request(app)
            .get('/api/users/favorites?page=1&limit=2')
            .set('Authorization', `Bearer ${userToken}`);
    
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('limit');
    });    

    test('Un utilisateur peut retirer un média de ses favoris', async () => {
        const res = await request(app)
            .post('/api/users/favorites/toggle')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ mediaId });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Média retiré des favoris');
    });

    test('Un admin peut désactiver un utilisateur, qui ne pourra plus se connecter', async () => {
        const resDeactivate = await request(app)
            .patch(`/api/users/${userId}/deactivate`)
            .set('Authorization', `Bearer ${adminToken}`);
    
        expect(resDeactivate.statusCode).toBe(200);
        expect(resDeactivate.body.message).toMatch(/désactivé/i);
    
        const loginAttempt = await request(app)
            .post('/api/auth/login')
            .send({
                email: testEmail,
                password: testPassword
            });
    
        expect(loginAttempt.statusCode).toBe(403);
        expect(loginAttempt.body.message).toMatch(/désactivé/i);
    });    

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
        await mongoose.connection.close();
    });
});