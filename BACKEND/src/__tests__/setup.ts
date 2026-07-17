import { connectDB } from '../database/mongodb';
import mongoose from 'mongoose';

// Increase default timeout for async operations (e.g., DB connection)
import { jest } from '@jest/globals';
jest.setTimeout(30000);

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});
