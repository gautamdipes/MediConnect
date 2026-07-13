import mongoose from "mongoose";
import { HospitalModel } from "./src/models/hospital.model";
import { DoctorModel } from "./src/models/doctor.model";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mediconnect";

const hospitalsData = [
  {
    hospitalName: "City Heart Institute",
    city: "New York",
    state: "NY",
    rating: 4.8,
    type: "Specialist",
    departments: ["Cardiology", "Emergency"],
    emergency: true,
    image: "photo-1519494026892-80bbd2d6fd0d",
    phoneNumber: "555-1001",
    email: "contact@cityheart.com"
  },
  {
    hospitalName: "Westside Medical",
    city: "New York",
    state: "NY",
    rating: 4.5,
    type: "General",
    departments: ["General Medicine", "Pediatrics", "Neurology"],
    emergency: true,
    image: "photo-1586773860418-d37222d8fce3",
    phoneNumber: "555-1002",
    email: "contact@westsidemedical.com"
  },
  {
    hospitalName: "Metropolis Wellness",
    city: "Brooklyn",
    state: "NY",
    rating: 4.2,
    type: "Clinic",
    departments: ["General Medicine", "Dermatology"],
    emergency: false,
    image: "photo-1587351021759-3e566b6af7cc",
    phoneNumber: "555-1003",
    email: "contact@metropoliswellness.com"
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    // Clear out existing test data to ensure clean natural state
    await HospitalModel.deleteMany({});
    await DoctorModel.deleteMany({});

    const createdHospitals = [];
    for (const h of hospitalsData) {
      const newHosp = await HospitalModel.create(h);
      createdHospitals.push(newHosp);
    }

    const doctorsData: any[] = [
      {
        fullName: "Dr. Sarah Smith",
        email: "sarah.smith@example.com",
        phone: "555-0101",
        specialization: "Cardiologist",
        department: "Cardiology",
        hospitalId: createdHospitals[0]._id, // City Heart
        hospitalName: createdHospitals[0].hospitalName,
        experience: 12,
        rating: 4.9,
        status: "ACTIVE",
        gender: "Female",
        profileImage: "photo-1559839734-2b71ea197ec2"
      },
      {
        fullName: "Dr. Alan Turing",
        email: "alan.turing@example.com",
        phone: "555-0102",
        specialization: "Neurologist",
        department: "Neurology",
        hospitalId: createdHospitals[1]._id, // Westside
        hospitalName: createdHospitals[1].hospitalName,
        experience: 8,
        rating: 4.8,
        status: "ACTIVE",
        gender: "Male",
        profileImage: "photo-1622253692010-333f2da6031d"
      },
      {
        fullName: "Dr. Elena Rodriguez",
        email: "elena.r@example.com",
        phone: "555-0103",
        specialization: "Pediatrician",
        department: "Pediatrics",
        hospitalId: createdHospitals[1]._id, // Westside
        hospitalName: createdHospitals[1].hospitalName,
        experience: 5,
        rating: 5.0,
        status: "ACTIVE",
        gender: "Female",
        profileImage: "photo-1594824476967-48c8b964273f"
      }
    ];

    for (const d of doctorsData) {
      await DoctorModel.create(d);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
