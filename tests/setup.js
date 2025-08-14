import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Configuration pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DISABLE_EXTERNAL_APIS = 'true'; // Désactiver les APIs externes

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }

  await new Promise(resolve => setTimeout(resolve, 100));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
