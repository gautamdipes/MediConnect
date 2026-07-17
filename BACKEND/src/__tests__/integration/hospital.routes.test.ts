// src/__tests__/integration/hospital.routes.test.ts
import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';
import { clearDatabase, registerAndLogin, authHeader } from '../test-utils';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediconnect_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Admin Hospital Routes', () => {
  let adminToken: string;

  beforeEach(async () => {
    const login = await registerAndLogin(true);
    adminToken = login.token;
  });

  const sampleHospital = {
    hospitalName: 'Test Hospital',
    email: 'hospital@example.com',
    address: '123 Test St',
    phoneNumber: '+1234567890',
    city: 'Test City',
    state: 'Test State',
    status: 'PENDING',
  };

  test('POST /api/admin/hospitals - create success', async () => {
    const res = await request(app)
      .post('/api/v1/admin/hospitals')
      .set(authHeader(adminToken))
      .send(sampleHospital)
      .expect(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.hospitalName).toBe(sampleHospital.hospitalName);
  });

  test('POST duplicate email returns 400', async () => {
    await request(app)
      .post('/api/v1/admin/hospitals')
      .set(authHeader(adminToken))
      .send(sampleHospital)
      .expect(201);
    const dupRes = await request(app)
      .post('/api/v1/admin/hospitals')
      .set(authHeader(adminToken))
      .send(sampleHospital)
      .expect(400);
    expect(dupRes.body.message).toMatch(/duplicate|already exists/i);
  });

  test('GET /api/admin/hospitals - list pagination', async () => {
    for (let i = 0; i < 12; i++) {
      await request(app)
        .post('/api/v1/admin/hospitals')
        .set(authHeader(adminToken))
        .send({ ...sampleHospital, email: `h${i}@example.com`, hospitalName: `Hospital ${i}` })
        .expect(201);
    }
    const res = await request(app)
      .get('/api/v1/admin/hospitals?page=2&limit=5')
      .set(authHeader(adminToken))
      .expect(200);
    expect(res.body.page).toBe(2);
    expect(res.body.total).toBe(12);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.hospitals).toHaveLength(5);
  });

  test('GET /api/admin/hospitals/:id - fetch single', async () => {
    const createRes = await request(app)
      .post('/api/v1/admin/hospitals')
      .set(authHeader(adminToken))
      .send(sampleHospital)
      .expect(201);
    const id = createRes.body._id;
    const getRes = await request(app)
        .get(`/api/v1/admin/hospitals/${id}`)
      .set(authHeader(adminToken))
      .expect(200);
    expect(getRes.body.hospitalName).toBe(sampleHospital.hospitalName);
  });

  test('GET non‑existent hospital returns 404', async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/v1/admin/hospitals/${fakeId}`)
      .set(authHeader(adminToken))
      .expect(404);
  });

  test('PUT /api/admin/hospitals/:id - update status', async () => {
    const createRes = await request(app)
      .post('/api/v1/admin/hospitals')
      .set(authHeader(adminToken))
      .send(sampleHospital)
      .expect(201);
    const id = createRes.body._id;
    const updateRes = await request(app)
        .put(`/api/v1/admin/hospitals/${id}`)
      .set(authHeader(adminToken))
      .send({ status: 'VERIFIED' })
      .expect(200);
    expect(updateRes.body.status).toBe('VERIFIED');
  });

  test('DELETE /api/admin/hospitals/:id - delete works', async () => {
    const createRes = await request(app)
      .post('/api/v1/admin/hospitals')
      .set(authHeader(adminToken))
      .send(sampleHospital)
      .expect(201);
    const id = createRes.body._id;
    await request(app)
      .delete(`/api/v1/admin/hospitals/${id}`)
      .set(authHeader(adminToken))
      .expect(200);
    await request(app)
      .get(`/api/v1/admin/hospitals/${id}`)
      .set(authHeader(adminToken))
      .expect(404);
  });
});
