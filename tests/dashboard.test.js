import request from 'supertest';
import { app, server } from '../server.js';

describe('Dashboard Routes', () => {
    let adminToken;
    let userToken;

    beforeAll(async () => {
        // Connexion admin
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'admin'
            });

        adminToken = adminLogin.body.accessToken;
        expect(adminToken).toBeDefined();

        // Création et connexion utilisateur normal
        const timestamp = Date.now();
        const userRegister = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User Dashboard',
                email: `testdashboard_${timestamp}@example.com`,
                password: 'password123'
            });

        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: `testdashboard_${timestamp}@example.com`,
                password: 'password123'
            });

        userToken = userLogin.body.accessToken;
        expect(userToken).toBeDefined();
    });

    describe('GET /api/dashboard/stats', () => {
        test('Un admin peut accéder aux statistiques du dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            
            // Vérifier la structure de la réponse
            expect(res.body).toHaveProperty('users');
            expect(res.body.users).toHaveProperty('total');
            expect(res.body.users).toHaveProperty('active');
            expect(res.body.users).toHaveProperty('inactive');
            expect(res.body.users).toHaveProperty('newThisMonth');

            expect(res.body).toHaveProperty('media');
            expect(res.body.media).toHaveProperty('total');
            expect(res.body.media).toHaveProperty('byType');
            expect(res.body.media.byType).toHaveProperty('book');
            expect(res.body.media.byType).toHaveProperty('movie');
            expect(res.body.media.byType).toHaveProperty('music');

            expect(res.body).toHaveProperty('borrows');
            expect(res.body.borrows).toHaveProperty('active');
            expect(res.body.borrows).toHaveProperty('overdue');
            expect(res.body.borrows).toHaveProperty('returned');
            expect(res.body.borrows).toHaveProperty('total');

            expect(res.body).toHaveProperty('topBorrowedMedia');
            expect(Array.isArray(res.body.topBorrowedMedia)).toBe(true);

            expect(res.body).toHaveProperty('recentBorrows');
            expect(Array.isArray(res.body.recentBorrows)).toBe(true);

            expect(res.body).toHaveProperty('mostActiveUsers');
            expect(Array.isArray(res.body.mostActiveUsers)).toBe(true);

            expect(res.body).toHaveProperty('alerts');
            expect(Array.isArray(res.body.alerts)).toBe(true);

            expect(res.body).toHaveProperty('overdueDetails');
            expect(Array.isArray(res.body.overdueDetails)).toBe(true);
        });

        test('Un utilisateur normal ne peut pas accéder au dashboard', async () => {
            const res = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/administrateurs/i);
        });

        test('Accès refusé sans token', async () => {
            const res = await request(app).get('/api/dashboard/stats');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/dashboard/borrows/stats', () => {
        test('Un admin peut obtenir les statistiques d\'emprunts par période', async () => {
            const res = await request(app)
                .get('/api/dashboard/borrows/stats?period=month')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('period', 'month');
            expect(res.body).toHaveProperty('startDate');
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('Statistiques par semaine', async () => {
            const res = await request(app)
                .get('/api/dashboard/borrows/stats?period=week')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.period).toBe('week');
        });

        test('Statistiques par année', async () => {
            const res = await request(app)
                .get('/api/dashboard/borrows/stats?period=year')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.period).toBe('year');
        });
    });

    describe('GET /api/dashboard/media/categories', () => {
        test('Un admin peut obtenir les statistiques par catégorie', async () => {
            const res = await request(app)
                .get('/api/dashboard/media/categories')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);

            // Si des catégories existent
            if (res.body.length > 0) {
                const category = res.body[0];
                expect(category).toHaveProperty('_id'); // Nom de la catégorie
                expect(category).toHaveProperty('types');
                expect(Array.isArray(category.types)).toBe(true);
                expect(category).toHaveProperty('total');
            }
        });
    });

    afterAll(async () => {
        if (server && server.close) {
            server.close();
        }
    });
});