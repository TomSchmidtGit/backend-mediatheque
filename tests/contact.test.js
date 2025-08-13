import request from 'supertest';
import { app } from '../server.js';
import {
  expectErrorResponse,
  expectSuccessResponse,
  waitForRateLimit,
} from './utils/testHelpers.js';

describe('Contact Routes', () => {
  describe('POST /api/contact', () => {
    test('Doit créer un message de contact avec des données valides', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      };

      const res = await request(app).post('/api/contact').send(contactData);

      expectSuccessResponse(res, 200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe(
        'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
      );
    });

    test('Doit valider les données obligatoires', async () => {
      // Attendre un peu pour éviter le rate limiting
      await waitForRateLimit(2000);

      // Test sans nom
      const res1 = await request(app).post('/api/contact').send({
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      });

      expectErrorResponse(res1, 400);

      // Test sans email
      const res2 = await request(app).post('/api/contact').send({
        name: 'Test User',
        subject: 'Test Subject',
        message: 'Test message content',
      });

      expectErrorResponse(res2, 400);

      // Test sans sujet
      const res3 = await request(app).post('/api/contact').send({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message content',
      });

      expectErrorResponse(res3, 400);

      // Test sans message
      const res4 = await request(app).post('/api/contact').send({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
      });

      expectErrorResponse(res4, 400);
    });

    test("Doit valider le format de l'email", async () => {
      await waitForRateLimit(2000);

      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
      ];

      for (const email of invalidEmails) {
        const res = await request(app).post('/api/contact').send({
          name: 'Test User',
          email,
          subject: 'Test Subject',
          message: 'Test message content',
        });

        expectErrorResponse(res, 400);
      }
    });

    test('Doit valider la longueur des champs', async () => {
      await waitForRateLimit(2000);

      // Test avec nom trop court
      const res1 = await request(app).post('/api/contact').send({
        name: 'A',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      });

      expectErrorResponse(res1, 400);

      // Test avec nom trop long
      const res2 = await request(app)
        .post('/api/contact')
        .send({
          name: 'A'.repeat(101),
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'Test message content',
        });

      expectErrorResponse(res2, 400);

      // Test avec sujet trop long
      const res3 = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'A'.repeat(201),
          message: 'Test message content',
        });

      expectErrorResponse(res3, 400);

      // Test avec message trop court
      const res4 = await request(app).post('/api/contact').send({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Short',
      });

      expectErrorResponse(res4, 400);

      // Test avec message trop long
      const res5 = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'A'.repeat(2001),
        });

      expectErrorResponse(res5, 400);
    });

    test('Doit accepter des caractères spéciaux dans le message', async () => {
      await waitForRateLimit(2000);

      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message:
          'Message avec caractères spéciaux: éèàçù, ponctuation ! ? ; : " \' ( ) [ ] { } @ # $ % ^ & * + = - _ | \\ / < > ~ `',
      };

      const res = await request(app).post('/api/contact').send(contactData);

      expectSuccessResponse(res, 200);
    });

    test('Doit gérer les espaces dans les noms', async () => {
      await waitForRateLimit(2000);

      const contactData = {
        name: 'Jean-Pierre Dupont-Martin',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      };

      const res = await request(app).post('/api/contact').send(contactData);

      expectSuccessResponse(res, 200);
    });
  });

  describe('Gestion des erreurs avancées', () => {
    test('Doit gérer les erreurs de validation complexes', async () => {
      await waitForRateLimit(2000);

      // Test avec des données très longues
      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'A'.repeat(150),
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'Test message content',
        });

      expectErrorResponse(res, 400);
    });

    test("Doit gérer les erreurs de format d'email complexes", async () => {
      await waitForRateLimit(2000);

      const complexEmails = [
        'test..test@example.com',
        'test@.example.com',
        'test@example..com',
        'test@example.com.',
        '.test@example.com',
      ];

      for (const email of complexEmails) {
        const res = await request(app).post('/api/contact').send({
          name: 'Test User',
          email,
          subject: 'Test Subject',
          message: 'Test message content',
        });

        expectErrorResponse(res, 400);
      }
    });

    test('Doit gérer les erreurs de caractères spéciaux complexes', async () => {
      await waitForRateLimit(2000);

      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message:
          'Message avec caractères très spéciaux: 🚀🎉✨💻📱🎵🎬🎭🎨🎪🎫🎟️🎠🎡🎢🎣🎤🎥🎦🎧🎨🎩🎪🎫🎟️🎠🎡🎢🎣🎤🎥🎦🎧🎨🎩',
      };

      const res = await request(app).post('/api/contact').send(contactData);

      expectSuccessResponse(res, 200);
    });

    test('Doit gérer les erreurs de validation des champs optionnels', async () => {
      await waitForRateLimit(2000);

      // Test avec téléphone invalide
      const res = await request(app).post('/api/contact').send({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
        phone: 'invalid-phone',
      });

      expectErrorResponse(res, 400);
    });
  });
});
