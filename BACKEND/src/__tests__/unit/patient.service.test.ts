// src/__tests__/unit/patient.service.test.ts
import { HospitalPatientService } from "../../services/hospital/patient.service";
import { HospitalModel } from "../../models/hospital.model";
import { UserModel } from "../../models/user.model";
import { clearDatabase } from "../test-utils";
import mongoose from "mongoose";

describe('HospitalPatientService', () => {
  let service: HospitalPatientService;
  let hospitalId: string;

  beforeAll(async () => {
    service = new HospitalPatientService();
  });

  beforeEach(async () => {
    // Ensure a clean DB
    await clearDatabase();
    // Remove any existing hospitals (in case dropDatabase didn't clear indexes)
    await HospitalModel.deleteMany({});
    // Create a fresh test hospital for each test
    const hospital = await HospitalModel.create({
      hospitalName: 'Test Hospital',
      email: 'hospital@example.com',
      phoneNumber: '1234567890',
      city: 'Test City',
      state: 'Test State',
      departments: ['General'],
    });
    hospitalId = String(hospital._id);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  test('createPatient succeeds with valid data', async () => {
    const payload = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '555-111-2222',
      age: 30,
      gender: 'male',
      department: 'Cardiology',
      notes: 'Test patient',
    };
    const result = await service.createPatient(hospitalId, payload);
    expect(result).toMatchObject({
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      age: payload.age,
      gender: payload.gender,
      department: payload.department,
      notes: payload.notes,
    });
    expect(result._id).toBeDefined();
  });

  test('listPatients returns pagination meta', async () => {
    // Insert two patients first
    await service.createPatient(hospitalId, {
      fullName: 'Alice',
      email: 'alice@example.com',
      phoneNumber: '555-000-1111',
    });
    await service.createPatient(hospitalId, {
      fullName: 'Bob',
      email: 'bob@example.com',
      phoneNumber: '555-222-3333',
    });

    const result = await service.listPatients(hospitalId, { page: 1, limit: 10 });
    expect(result.meta).toMatchObject({ page: 1, limit: 10, total: 2 });
    expect(result.patients).toHaveLength(2);
    const names = result.patients.map((p: any) => p.fullName).sort();
    expect(names).toEqual(['Alice', 'Bob']);
  });

  test('getPatientDetails returns patient, appointments, medicalRecords', async () => {
    // Create a user that will act as patient
    const user = await UserModel.create({
      fullName: 'Charlie',
      email: 'charlie@example.com',
      phoneNumber: '555-999-0000',
      password: 'Password123!', // hashed via pre‑save hook
    });
    // Associate patient with hospital via HospitalPatientModel (import inside test)
    const { HospitalPatientModel } = require('../../models/hospital-patient.model');
    await HospitalPatientModel.create({
      hospitalId,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      _id: user._id,
    });

    const details = await service.getPatientDetails(hospitalId, String(user._id));
    expect(details.patient).toMatchObject({
      _id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
    // No appointments or medical records were added, so arrays should be empty
    expect(details.appointments).toEqual([]);
    expect(details.medicalRecords).toEqual([]);
  });
});
