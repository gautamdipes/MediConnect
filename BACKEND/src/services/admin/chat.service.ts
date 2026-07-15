import { AppointmentModel } from "../../models/appointment.model";
import { DoctorModel } from "../../models/doctor.model";
import { HospitalModel } from "../../models/hospital.model";
import { MedicalRecordModel } from "../../models/medical-record.model";
import { UserModel } from "../../models/user.model";
import { UserRepository } from "../../repositories/user.repository";
import { generateGeminiText } from "../gemini.client";

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
  | "medical_records"
  | "general";

type AdminContext = {
  admin: { fullName: string; email: string };
  stats: {
    totalPatients: number;
    totalDoctors: number;
    activeDoctors: number;
    totalHospitals: number;
    totalAppointments: number;
    pendingAppointments: number;
    totalRecords: number;
  };
  doctors: Array<Record<string, unknown>>;
  hospitals: Array<Record<string, unknown>>;
  patients: Array<Record<string, unknown>>;
  appointments: Array<Record<string, unknown>>;
};

const SPECIALTY_KEYWORDS: Array<{ key: RegExp; labels: string[] }> = [
  { key: /cardio|heart/i, labels: ["cardiology", "cardiologist", "heart"] },
  { key: /derm|skin/i, labels: ["dermatology", "dermatologist", "skin"] },
  { key: /ortho|bone|joint|fracture/i, labels: ["orthopedic", "orthopedics", "bone"] },
  { key: /pedia|child|kids?/i, labels: ["pediatrics", "pediatrician", "child"] },
  { key: /neuro|brain|migraine|headache/i, labels: ["neurology", "neurologist", "brain"] },
  { key: /gyne|ob.?gyn|pregnancy/i, labels: ["gynecology", "gynecologist", "obgyn"] },
  { key: /ent|ear|nose|throat/i, labels: ["ent", "ear", "nose", "throat"] },
  { key: /dental|teeth|tooth|dentist/i, labels: ["dental", "dentist", "teeth"] },
  { key: /eye|ophthal|vision/i, labels: ["ophthalmology", "eye", "vision"] },
  { key: /psych|mental|anxiety|depress/i, labels: ["psychiatry", "psychologist", "mental"] },
  { key: /general|gp|family/i, labels: ["general", "family", "physician"] },
];

function detectAdminIntent(message: string): AdminIntent {
  const text = message.toLowerCase().trim();

  if (/\b(stats?|overview|dashboard|summary|how many|total counts?)\b/i.test(text)) {
    return "overview_stats";
  }
  if (/\b(medical records?|lab reports?|ehr)\b/i.test(text)) {
    return "medical_records";
  }
  if (/\bappointment/i.test(text)) {
    return "list_appointments";
  }
  if (
    /\b(find|search|recommend).*\b(doctor|specialist)/i.test(text) ||
    /\bdoctor.*(near|for|named|specialty)\b/i.test(text) ||
    SPECIALTY_KEYWORDS.some((s) => s.key.test(text) && /\b(doctor|specialist|find)\b/i.test(text))
  ) {
    return "find_doctor";
  }
  if (/\b(find|search|recommend).*\b(hospital|clinic|facilit)/i.test(text)) {
    return "find_hospital";
  }
  if (/\b(patient|users?)\b/i.test(text)) return "list_patients";
  if (/\bdoctors?\b/i.test(text)) return "list_doctors";
  if (/\bhospitals?|clinic|facilit/i.test(text)) return "list_hospitals";
  return "general";
}

function extractHints(message: string): string[] {
  const hints: string[] = [];
  for (const s of SPECIALTY_KEYWORDS) {
    if (s.key.test(message)) hints.push(...s.labels);
  }
  const cityMatch = message.match(/\bin\s+([A-Za-z][A-Za-z\s-]{1,30})\b/i);
  if (cityMatch?.[1]) hints.push(cityMatch[1].trim().toLowerCase());
  return [...new Set(hints)];
}

function matchesHints(row: Record<string, unknown>, hints: string[]): boolean {
  if (!hints.length) return true;
  const hay = Object.values(row).flat().join(" ").toLowerCase();
  return hints.some((h) => hay.includes(h.toLowerCase()));
}

function intentInstructions(intent: AdminIntent): string {
  switch (intent) {
    case "overview_stats":
      return `INTENT: SYSTEM OVERVIEW — report exact counts from stats. Mention pending appointments if useful. Keep under 120 words.`;
    case "list_doctors":
    case "find_doctor":
      return `INTENT: DOCTORS — list matching doctors from data (name, specialty, hospital, status). Max 8. If specialty hinted, prioritize matches.`;
    case "list_hospitals":
    case "find_hospital":
      return `INTENT: HOSPITALS — list matching hospitals (name, city, type, status). Max 8.`;
    case "list_patients":
      return `INTENT: PATIENTS — summarize patient count and list recent patients from data only (name/email). Max 10.`;
    case "list_appointments":
      return `INTENT: APPOINTMENTS — summarize recent appointments (patient, doctor, hospital, date, status). Max 10.`;
    case "medical_records":
      return `INTENT: MEDICAL RECORDS — report totalRecords from stats. Explain admins manage records via related patient/system pages; do not invent record contents.`;
    default:
      return `INTENT: GENERAL ADMIN HELP — answer with relevant data only. Stay on topic. Suggest the right admin page when helpful.`;
  }
}

function actionsForIntent(intent: AdminIntent): Array<{ label: string; href: string }> {
  switch (intent) {
    case "list_doctors":
    case "find_doctor":
      return [
        { label: "Doctors", href: "/admin/dashboard/staff" },
        { label: "Overview", href: "/admin/dashboard" },
      ];
    case "list_hospitals":
    case "find_hospital":
      return [
        { label: "Hospitals", href: "/admin/dashboard/facilities" },
        { label: "Overview", href: "/admin/dashboard" },
      ];
    case "list_patients":
      return [
        { label: "Patients", href: "/admin/dashboard/patients" },
        { label: "Overview", href: "/admin/dashboard" },
      ];
    case "list_appointments":
      return [
        { label: "Appointments", href: "/admin/dashboard/appointments" },
        { label: "Overview", href: "/admin/dashboard" },
      ];
    case "medical_records":
      return [
        { label: "Patients", href: "/admin/dashboard/patients" },
        { label: "Overview", href: "/admin/dashboard" },
      ];
    default:
      return [
        { label: "Overview", href: "/admin/dashboard" },
        { label: "Patients", href: "/admin/dashboard/patients" },
        { label: "Doctors", href: "/admin/dashboard/staff" },
      ];
  }
}

function sanitizeHistory(history: unknown): ChatHistoryItem[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (h): h is ChatHistoryItem =>
        !!h &&
        typeof h === "object" &&
        ((h as ChatHistoryItem).role === "user" || (h as ChatHistoryItem).role === "assistant") &&
        typeof (h as ChatHistoryItem).content === "string"
    )
    .map((h) => ({
      role: h.role,
      content: String(h.content).slice(0, 500),
    }))
    .slice(-6);
}

export class AdminChatService {
  async buildContext(adminUserId: string): Promise<AdminContext> {
    const admin = await userRepo.findById(adminUserId);
    if (!admin) throw { status: 404, message: "Admin not found" };

    const [
      totalPatients,
      totalDoctors,
      activeDoctors,
      totalHospitals,
      totalAppointments,
      pendingAppointments,
      totalRecords,
      doctors,
      hospitals,
      patients,
      appointments,
    ] = await Promise.all([
      UserModel.countDocuments({ $or: [{ role: "user" }, { role: { $exists: false } }, { role: null }] }),
      DoctorModel.countDocuments(),
      DoctorModel.countDocuments({ status: "ACTIVE" }),
      HospitalModel.countDocuments(),
      AppointmentModel.countDocuments(),
      AppointmentModel.countDocuments({ status: { $in: ["PENDING", "CONFIRMED"] } }),
      MedicalRecordModel.countDocuments(),
      DoctorModel.find()
        .select("fullName specialization department hospitalName rating status experience")
        .sort({ rating: -1 })
        .limit(40)
        .lean(),
      HospitalModel.find()
        .select("hospitalName city state type status departments")
        .limit(30)
        .lean(),
      UserModel.find({ $or: [{ role: "user" }, { role: { $exists: false } }, { role: null }] })
        .select("fullName email phoneNumber createdAt")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      AppointmentModel.find()
        .populate("doctorId", "fullName specialization")
        .populate("hospitalId", "hospitalName city")
        .populate("patientId", "fullName email")
        .sort({ date: -1 })
        .limit(20)
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
        activeDoctors,
        totalHospitals,
        totalAppointments,
        pendingAppointments,
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

  scopeContext(full: AdminContext, intent: AdminIntent, message: string) {
    const hints = extractHints(message);
    const base = { admin: full.admin, stats: full.stats };

    switch (intent) {
      case "overview_stats":
        return { ...base, recentAppointments: full.appointments.slice(0, 5) };
      case "list_doctors":
      case "find_doctor": {
        const matched = full.doctors.filter((d) => matchesHints(d, hints));
        return {
          ...base,
          searchHints: hints,
          doctors: (matched.length ? matched : full.doctors).slice(0, 10),
        };
      }
      case "list_hospitals":
      case "find_hospital": {
        const matched = full.hospitals.filter((h) => matchesHints(h, hints));
        return {
          ...base,
          searchHints: hints,
          hospitals: (matched.length ? matched : full.hospitals).slice(0, 10),
        };
      }
      case "list_patients":
        return { ...base, patients: full.patients.slice(0, 12) };
      case "list_appointments":
        return { ...base, appointments: full.appointments.slice(0, 12) };
      case "medical_records":
        return { ...base, note: "Record details are per-patient; use Patients page for deep review." };
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
    const trimmed = String(message || "").trim();
    if (!trimmed) {
      throw { status: 400, message: "message is required" };
    }

    const intent = detectAdminIntent(trimmed);
    const full = await this.buildContext(adminUserId);
    const scoped = this.scopeContext(full, intent, trimmed);
    const cleanHistory = sanitizeHistory(history);

    const system = `You are MediConnect Admin AI Assistant for hospital network administrators.

${intentInstructions(intent)}

GLOBAL RULES:
- Help with operations: patients, doctors, hospitals, appointments, medical-record counts, and overview stats.
- Use ONLY the SYSTEM DATA JSON below. Never invent people, hospitals, or appointments.
- Be concise and actionable. Prefer short bullets. Keep replies under 180 words.
- Suggest admin UI paths when useful: /admin/dashboard, /admin/dashboard/patients, /admin/dashboard/staff, /admin/dashboard/facilities, /admin/dashboard/appointments.
- Do not give clinical diagnoses. You assist with operations, not treating patients.
- Address the admin by first name when natural.

SYSTEM DATA:
${JSON.stringify(scoped)}`;

    const guided =
      intent === "overview_stats"
        ? `Admin wants system overview/stats.\nMessage: ${trimmed}`
        : intent === "find_doctor" || intent === "list_doctors"
          ? `Admin wants doctor information.\nMessage: ${trimmed}`
          : intent === "find_hospital" || intent === "list_hospitals"
            ? `Admin wants hospital information.\nMessage: ${trimmed}`
            : intent === "list_patients"
              ? `Admin wants patient information.\nMessage: ${trimmed}`
              : intent === "list_appointments"
                ? `Admin wants appointment information.\nMessage: ${trimmed}`
                : trimmed;

    const contents = [
      ...cleanHistory.map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      { role: "user", parts: [{ text: guided }] },
    ];

    const reply = await generateGeminiText({
      systemInstruction: system,
      contents,
      maxOutputTokens: 512,
      temperature: 0.35,
    });

    return {
      reply,
      intent,
      actions: actionsForIntent(intent),
      meta: full.stats,
    };
  }
}
