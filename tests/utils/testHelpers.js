import request from 'supertest';
import { app } from '../../server.js';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

export const createTestUser = async (userData = {}) => {
  const defaultData = {
    name: `Test User ${Date.now()}`,
    email: `testuser_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`,
    password: 'password123',
    role: 'user',
    ...userData
  };

  const user = new User(defaultData);
  await user.save();
  return user;
};

export const createTestAdmin = async () => {
  return createTestUser({
    name: 'Test Admin',
    email: `admin_${Date.now()}@example.com`,
    role: 'admin'
  });
};

export const loginUser = async (email, password) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.body.message}`);
  }

  return response.body.accessToken;
};

export const createAndLoginUser = async (userData = {}) => {
  const user = await createTestUser(userData);
  const token = await loginUser(user.email, 'password123');
  return { user, token };
};

export const createAndLoginAdmin = async () => {
  const admin = await createTestAdmin();
  const token = await loginUser(admin.email, 'password123');
  return { admin, token };
};

export const generateUniqueData = (prefix = 'test') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const microtime = process.hrtime.bigint();
  return `${prefix}_${timestamp}_${random}_${microtime}`;
};

export const createTestMediaData = (overrides = {}) => {
  return {
    title: generateUniqueData('Test Media'),
    type: 'book',
    author: generateUniqueData('Test Author'),
    year: 2020,
    description: generateUniqueData('Test description'),
    ...overrides
  };
};

export const createTestCategoryData = (overrides = {}) => {
  return {
    name: generateUniqueData('Test Category'),
    description: generateUniqueData('Test category description'),
    ...overrides
  };
};

export const createTestTagData = (overrides = {}) => {
  return {
    name: generateUniqueData('Test Tag'),
    description: generateUniqueData('Test tag description'),
    ...overrides
  };
};

export const createTestBorrowData = (overrides = {}) => {
  return {
    user: overrides.user || '507f1f77bcf86cd799439011',
    media: overrides.media || '507f1f77bcf86cd799439012',
    dueDate: overrides.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    ...overrides
  };
};

export const createTestContactData = (overrides = {}) => {
  return {
    name: generateUniqueData('Test Contact'),
    email: `contact_${Date.now()}@example.com`,
    subject: generateUniqueData('Test Subject'),
    message: generateUniqueData('Test message content'),
    ...overrides
  };
};

export const createTestMedia = async (overrides = {}) => {
  const Media = (await import('../../models/Media.js')).default;
  const mediaData = createTestMediaData(overrides);
  const media = new Media(mediaData);
  await media.save();
  return media;
};

export const createTestCategory = async (overrides = {}) => {
  const Category = (await import('../../models/Category.js')).default;
  const categoryData = createTestCategoryData(overrides);
  const category = new Category(categoryData);
  await category.save();
  return category;
};

export const createTestTag = async (overrides = {}) => {
  const Tag = (await import('../../models/Tag.js')).default;
  const tagData = createTestTagData(overrides);
  const tag = new Tag(tagData);
  await tag.save();
  return tag;
};

export const createTestBorrow = async (overrides = {}) => {
  const user = await createTestUser();
  const media = await createTestMedia();
  
  const borrowData = createTestBorrowData({
    user: user._id,
    media: media._id,
    ...overrides
  });
  
  const Borrow = (await import('../../models/Borrow.js')).default;
  const borrow = new Borrow(borrowData);
  await borrow.save();
  
  return { borrow, user, media };
};

export const expectSuccessResponse = (response, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toBeDefined();
};

export const expectErrorResponse = (response, expectedStatus, expectedMessage) => {
  expect(response.status).toBe(expectedStatus);
  
  if (response.body.errors && Array.isArray(response.body.errors)) {
    expect(response.body.errors).toBeDefined();
    if (expectedMessage) {
      if (typeof expectedMessage === 'string') {
        expect(response.body.errors.some(err => err.includes(expectedMessage))).toBe(true);
      } else if (expectedMessage instanceof RegExp) {
        expect(response.body.errors.some(err => expectedMessage.test(err))).toBe(true);
      }
    }
  } else if (response.body.message) {
    expect(response.body.message).toBeDefined();
    if (expectedMessage) {
      if (typeof expectedMessage === 'string') {
        expect(response.body.message).toBe(expectedMessage);
      } else if (expectedMessage instanceof RegExp) {
        expect(expectedMessage.test(response.body.message)).toBe(true);
      }
    }
  }
};

export const expectResponseProperties = (response, expectedProperties) => {
  expectedProperties.forEach(prop => {
    expect(response.body).toHaveProperty(prop);
  });
};

export const expectResponseStructure = (response, expectedStructure) => {
  expect(response.body).toMatchObject(expectedStructure);
};

export const waitForRateLimit = async (ms = 1000) => {
  await new Promise(resolve => setTimeout(resolve, ms));
};
