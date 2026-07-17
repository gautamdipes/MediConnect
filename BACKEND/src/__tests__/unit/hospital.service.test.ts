// src/__tests__/unit/hospital.service.test.ts
import { AdminHospitalService } from '../../services/admin/hospital.service';
import { HospitalModel } from '../../models/hospital.model';
import mongoose from 'mongoose';
import { clearDatabase } from '../test-utils';

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

describe('AdminHospitalService', () => {
  const service = new AdminHospitalService();

  const sampleHospital = {
    hospitalName: 'Test Hospital',
    email: 'hospital@example.com',
    address: '123 Test St',
    phoneNumber: '+1234567890',
    city: 'Test City',
    state: 'Test State',
    status: 'PENDING',
  } as any;

  test('createHospital – success', async () => {
    const created = await service.createHospital(sampleHospital);
    expect(created).toHaveProperty('_id');
    expect(created.hospitalName).toBe(sampleHospital.hospitalName);
  });

  test('createHospital – duplicate email throws', async () => {
    await service.createHospital(sampleHospital);
      await expect(service.createHospital(sampleHospital)).rejects.toMatchObject({ status: 400 });
  });

  test('listHospitals – pagination works', async () => {
    for (let i = 0; i < 15; i++) {
      await service.createHospital({
        ...sampleHospital,
        hospitalName: `Hospital ${i}`,
        email: `h${i}@example.com`,
      });
    }
    const result = await service.listHospitals({ page: 2, limit: 5 });
    expect(result.page).toBe(2);
    expect(result.total).toBe(15);
    expect(result.totalPages).toBe(3);
    expect(result.hospitals).toHaveLength(5);
  });

  test('getHospital – found', async () => {
    const created = await service.createHospital(sampleHospital);
    const fetched = await service.getHospital(String(created._id));
    expect(fetched.hospitalName).toBe(sampleHospital.hospitalName);
  });

  test('getHospital – not found throws 404', async () => {
    const bogusId = new mongoose.Types.ObjectId().toHexString();
    await expect(service.getHospital(bogusId)).rejects.toMatchObject({ status: 404 });
  });

  test('updateHospital – success', async () => {
    const created = await service.createHospital(sampleHospital);
    const updated = await service.updateHospital(String(created._id), { status: 'VERIFIED' });
    expect(updated.status).toBe('VERIFIED');
  });

  test('deleteHospital – success', async () => {
    const created = await service.createHospital(sampleHospital);
    const res = await service.deleteHospital(String(created._id));
    expect(res).toEqual({ message: 'Hospital deleted successfully' });
    await expect(service.getHospital(String(created._id))).rejects.toMatchObject({ status: 404 });
  });
});
