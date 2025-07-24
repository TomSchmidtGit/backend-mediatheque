import request from 'supertest';
import { app, server } from '../server.js';

describe('Auth Routes', () => {
    let token;
    let fakeToken = 'Bearer faketoken123.invalid.jwt';
    const testEmail = `testuser_${Date.now()}_${Math.floor(Math.random()*10000)}@example.com`;
    const testPassword = 'password123';

    test('Doit créer un nouvel utilisateur', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: testEmail,
                password: testPassword
            });

        console.log("Register Response:", res.body);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
    });

    test('Doit se connecter et recevoir un token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testEmail,
                password: testPassword
            });

        token = res.body.accessToken;
        expect(res.statusCode).toBe(200);
        expect(token).toBeDefined();
    });

    test('Refuse l\'accès sans token', async () => {
        const res = await request(app).get('/api/borrow');
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/token fourni/i);
    });

    test('Refuse l\'accès avec un token invalide', async () => {
        const res = await request(app)
            .get('/api/borrow')
            .set('Authorization', fakeToken);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/token invalide/i);
    });

    test('Doit se déconnecter et invalider le token', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

        console.log("Logout Response:", res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Déconnexion réussie');
    });

    test('Ne doit plus accéder aux routes protégées après déconnexion', async () => {
        const res = await request(app)
            .get('/api/borrow')
            .set('Authorization', `Bearer ${token}`);

        console.log("Access after Logout Response:", res.body);
        expect([401, 403]).toContain(res.statusCode);
        expect(res.body.message).toBe('Accès interdit');

    });

    test('Ne doit plus rafraîchir un token après logout', async () => {
        // Connexion pour obtenir tokens
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testEmail,
                password: testPassword
            });
    
        const accessToken = loginRes.body.accessToken;
        const refreshToken = loginRes.body.refreshToken;
    
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
    
        // Logout = suppression du refreshToken
        const logoutRes = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${accessToken}`);
    
        expect(logoutRes.statusCode).toBe(200);
    
        // Tentative de refresh après logout = 403
        const refreshRes = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken });
    
        expect(refreshRes.statusCode).toBe(403);
        expect(refreshRes.body.message).toMatch(/expiré|invalide/i);
    });    

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
    });
});