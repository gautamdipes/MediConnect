import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppointmentModel } from "../../models/appointment.model";
import { DoctorModel } from "../../models/doctor.model";
import { HospitalModel } from "../../models/hospital.model";
import { MedicalRecordModel } from "../../models/medical-record.model";
import { UserModel } from "../../models/user.model";
import { UserRepository } from "../../repositories/user.repository";

const userRepo = new UserRepository();

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type AdminIntent =
  | "overview_stats"
  | "list_doctors"
  | "list_hospitals"
  | "list_patients"
  | "list_appointments"
  | "find_doctor"
  | "find_hospital"
  | "general";

function detectAdminIntent(message: string): AdminIntent {
  const text = message.toLowerCase();

  if (/\b(stats?|overview|dashboard|summary|how many|total)\b/i.test(text)) {
    return "overview_stats";
  }
  if (/\b(patient|users?)\b/i.test(text) && /\b(list|show|all|find|who)\b/i.test(text)) {
    return "list_patients";
  }
  if (/\bappointment/i.test(text)) {
    return "list_appointments";
  }
  if (/\b(find|search|recommend).*\b(doctor|specialist)/i.test(text) || /\bdoctor.*(near|for|named)\b/i.test(text)) {
    return "find_doctor";
  }
  if (/\b(find|search|recommend).*\b(hospital|clinic)/i.test(text)) {
    return "find_hospital";
  }
  if (/\bdoctors?\b/i.test(text)) return "list_doctors";
  if (/\bhospitals?\b/i.test(text)) return "list_hospitals";
  if (/\bpatients?\b/i.test(text)) return "list_patients";
  return "general";
}

function intentInstructions(intent: AdminIntent): string {
  switch (intent) {
    case "overview_stats":
      return `INTENT: SYSTEM OVERVIEW — summarize counts and key signals from STATS and samples.`;
    case "list_doctors":
    case "find_doctor":
      return `INTENT: DOCTORS — recommend / list from DOCTORS data only. Match specialty if mentioned. Be concise.`;
    case "list_hospitals":
    case "find_hospital":
      return `INTENT: HOSPITALS — recommend / list from HOSPITALS data. Match city/type if mentioned.`;
    case "list_patients":
      return `INTENT: PATIENTS — summarize from PATIENTS sample. Do not invent patient PII beyond provided fields.`;
    case "list_appointments":
      return `INTENT: APPOINTMENTS — summarize recent appointments from APPOINTMENTS data.`;
    default:
      return `INTENT: GENERAL ADMIN HELP — answer using relevant SYSTEM DATA only. Stay on topic; do not dump unrelated lists.`;
  }
}

export class AdminChatService {
  async buildContext(adminUserId: string) {
    const admin = await userRepo.findById(adminUserId);
    if (!admin) throw { status: 404, message: "Admin not found" };

    const [
      totalPatients,
      totalDoctors,
      totalHospitals,
      totalAppointments,
      totalRecords,
      doctors,
      hospitals,
      patients,
      appointments,
    ] = await Promise.all([
      UserModel.countDocuments({ role: { $ne: "admin" } }),
      DoctorModel.countDocuments(),
      HospitalModel.countDocuments(),
      AppointmentModel.countDocuments(),
      MedicalRecordModel.countDocuments(),
      DoctorModel.find()
        .select("fullName specialization department hospitalName rating status experience")
        .limit(25)
        .lean(),
      HospitalModel.find()
        .select("hospitalName city state type status departments")
        .limit(20)
        .lean(),
      UserModel.find({ role: { $ne: "admin" } })
        .select("fullName email phoneNumber createdAt")
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
      AppointmentModel.find()
        .populate("doctorId", "fullName specialization")
        .populate("hospitalId", "hospitalName city")
        .populate("patientId", "fullName email")
        .sort({ date: -1 })
        .limit(15)
        .lean(),
    ]);

    return {
      admin: {
        fullName: admin.fullName,
        email: admin.email,
      },
      stats: {
        totalPatients,
        totalDoctors,
        totalHospitals,
        totalAppointments,
        totalRecords,
      },
      doctors: doctors.map((d: any) => ({
        id: String(d._id),
        fullName: d.fullName,
        specialization: d.specialization,
        department: d.department,
        hospitalName: d.hospitalName,
        rating: d.rating,
        status: d.status,
        experience: d.experience,
      })),
      hospitals: hospitals.map((h: any) => ({
        id: String(h._id),
        hospitalName: h.hospitalName,
        city: h.city,
        state: h.state,
        type: h.type,
        status: h.status,
        departments: h.departments,
      })),
      patients: patients.map((p: any) => ({
        id: String(p._id),
        fullName: p.fullName,
        email: p.email,
        phoneNumber: p.phoneNumber,
      })),
      appointments: appointments.map((a: any) => ({
        id: String(a._id),
        date: a.date,
        time: a.time,
        status: a.status,
        reason: a.reason,
        patient: a.patientId?.fullName || null,
        doctor: a.doctorId?.fullName || null,
        hospital: a.hospitalId?.hospitalName || null,
      })),
    };
  }

  scopeContext(full: Awaited<ReturnType<AdminChatService["buildContext"]>>, intent: AdminIntent) {
    const base = { admin: full.admin, stats: full.stats };
    switch (intent) {
      case "overview_stats":
        return { ...base, recentAppointments: full.appointments.slice(0, 5) };
      case "list_doctors":
      case "find_doctor":
        return { ...base, doctors: full.doctors.slice(0, 12) };
      case "list_hospitals":
      case "find_hospital":
        return { ...base, hospitals: full.hospitals.slice(0, 10) };
      case "list_patients":
        return { ...base, patients: full.patients.slice(0, 12) };
      case "list_appointments":
        return { ...base, appointments: full.appointments.slice(0, 12) };
      default:
        return {
          ...base,
          doctorsSample: full.doctors.slice(0, 5),
          hospitalsSample: full.hospitals.slice(0, 5),
          patientsSample: full.patients.slice(0, 5),
        };
    }
  }

  async chat(adminUserId: string, message: string, history: ChatHistoryItem[] = []) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw { status: 500, message: "GEMINI_API_KEY is not configured on the server" };
    }

    const intent = detectAdminIntent(message);
    const full = await this.buildContext(adminUserId);
    const scoped = this.scopeContext(full, intent);

    const system = `You are MediConnect Admin AI Assistant for hospital network administrators.

${intentInstructions(intent)}

GLOBAL RULES:
- Help with platform operations: patients, doctors, hospitals, appointments, and overview stats.
- Use ONLY the SYSTEM DATA JSON below. Never invent records.
- Be concise and actionable. Prefer short bullets.
- Suggest admin UI paths when useful: /admin/dashboard, /admin/dashboard/patients, /admin/dashboard/staff, /admin/dashboard/facilities, /admin/dashboard/appointments.
- Do not give clinical diagnoses. You assist with operations, not treating patients.

SYSTEM DATA:
${JSON.stringify(scoped)}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
      systemInstruction: system,
    });

    const contents = [
      ...history.slice(-4).map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content.slice(0, 500) }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const result = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.4,
      },
    });

    const reply = result.response.text()?.trim();
    if (!reply) throw { status: 502, message: "Empty response from AI" };

    return {
      reply,
      intent,
      actions: [
        { label: "Overview", href: "/admin/dashboard" },
        { label: "Patients", href: "/admin/dashboard/patients" },
        { label: "Doctors", href: "/admin/dashboard/staff" },
      ],
      meta: full.stats,
    };
  }
}
