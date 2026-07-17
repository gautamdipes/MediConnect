import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import mongoose from 'mongoose';

/**
 * Integration tests covering authentication flow and a few protected user routes.
 * The tests use a real MongoDB connection defined in the `setup.ts` file.
 * Adjust the test data if your validation rules differ.
 */

describe('Auth & User Integration Tests', () => {
  const testUser = {
    firstname: 'Test',
    lastname: 'User',
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    confirmPassword: 'password123',
  } as any;

  let authToken: string = '';

  // Ensure a clean state before the suite runs
  beforeAll(async () => {
    await UserModel.deleteOne({ email: testUser.email });
  });

  // Clean up after the suite finishes
  afterAll(async () => {
    await UserModel.deleteOne({ email: testUser.email });
    // Close mongoose connection (setup.ts already closes, but safeguard)
    await mongoose.connection.close();
  });

  /* -------------------------------------------------
   *  Registration
   * ------------------------------------------------- */
  test('POST /api/auth/register – success', async () => {
    const res = await request(app).post('/api/v1/users/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('User Created');
  });

  test('POST /api/auth/register – duplicate email fails', async () => {
    const res = await request(app).post('/api/v1/users/register').send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  /* -------------------------------------------------
   *  Login
   * ------------------------------------------------- */
  test('POST /api/auth/login – success returns token', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token; // Store token for subsequent requests
  });

  test('POST /api/auth/login – wrong password fails', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: testUser.email, password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  /* -------------------------------------------------
   *  WhoAmI (protected)
   * ------------------------------------------------- */
  test('GET /api/auth/whoami – returns user info when authenticated', async () => {
    const res = await request(app)
      .get('/api/v1/auth/whoami')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('GET /api/auth/whoami – fails without token', async () => {
    const res = await request(app).get('/api/v1/auth/whoami');
    expect(res.statusCode).toBe(401);
  });

  /* -------------------------------------------------
   *  Profile update (protected)
   * ------------------------------------------------- */
  test('POST /api/auth/update – update profile fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/update')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ phoneNumber: '+1234567890', fullName: 'Updated Test User' });
    expect(res.statusCode).toBe(200);
    // The controller returns the updated user; verify a changed field
    expect(res.body.phoneNumber).toBe('+1234567890');
    expect(res.body.fullName).toBe('Updated Test User');
  });

  /* -------------------------------------------------
   *  Password change (protected)
   * ------------------------------------------------- */
  test('PUT /api/auth/password – change password successfully', async () => {
    const res = await request(app)
      .put('/api/v1/auth/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ currentPassword: testUser.password, newPassword: 'newPass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('PUT /api/auth/password – fails with wrong current password', async () => {
    const res = await request(app)
      .put('/api/v1/auth/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ currentPassword: 'incorrect', newPassword: 'newPass123' });
    expect(res.statusCode).toBe(400);
  });

  /* -------------------------------------------------
   *  Protected user route example
   * ------------------------------------------------- */
  test('GET /api/v1/users/me – returns user profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });
});
