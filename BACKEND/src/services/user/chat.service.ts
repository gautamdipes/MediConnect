import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppointmentModel } from "../../models/appointment.model";
import { DoctorModel } from "../../models/doctor.model";
import { HospitalModel } from "../../models/hospital.model";
import { MedicalRecordModel } from "../../models/medical-record.model";
import { UserRepository } from "../../repositories/user.repository";

const userRepo = new UserRepository();

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type ChatAttachment = {
  name: string;
  url: string;
  size?: string;
  type: "pdf" | "image" | "file";
};

type Intent =
  | "book_appointment"
  | "list_my_appointments"
  | "find_doctor"
  | "find_hospital"
  | "medical_records"
  | "symptoms"
  | "general";

type PatientContext = {
  profile: {
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  appointments: Array<Record<string, unknown>>;
  medicalRecords: Array<Record<string, unknown>>;
  doctors: Array<Record<string, unknown>>;
  hospitals: Array<Record<string, unknown>>;
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

function detectIntent(message: string, history: ChatHistoryItem[]): Intent {
  const text = message.toLowerCase().trim();
  const recent = history
    .slice(-4)
    .map((h) => h.content.toLowerCase())
    .join(" ");

  const askingOwnHistory =
    /\b(my|mine|i have|i've|already|past|previous|upcoming|scheduled|show me my|list my|what appointments)\b/i.test(
      text
    );

  // Booking a NEW appointment (not listing existing ones)
  if (
    /\b(book|schedule|make|set up|arrange|need)\b.*\b(appointment|appt|visit|consulta)/i.test(text) ||
    /\b(appointment|appt)\b.*\b(book|schedule|make|set up|arrange)\b/i.test(text) ||
    /^(i want to |i'd like to |help me )?(book|schedule)/i.test(text) ||
    (/\bbook\b/i.test(text) && !askingOwnHistory)
  ) {
    // Only treat as list if clearly about existing bookings
    if (
      askingOwnHistory &&
      /\b(show|list|see|check|view|what|which)\b/i.test(text) &&
      !/\b(book|schedule|make|new)\b/i.test(text)
    ) {
      return "list_my_appointments";
    }
    return "book_appointment";
  }

  if (
    /\b(my appointments?|upcoming appointments?|past appointments?|appointment history|bookings?\s*(i|I've|ive)?\s*(made|have|done)|show.*appointments?)\b/i.test(
      text
    ) ||
    (askingOwnHistory && /\bappointments?\b/i.test(text) && !/\bbook|schedule|make\b/i.test(text))
  ) {
    return "list_my_appointments";
  }

  if (
    /\b(find|search|show|recommend|suggest|available|list)\b.*\b(doctor|physician|specialist)\b/i.test(text) ||
    /\b(doctor|physician|specialist)\b.*\b(near|around|available|for)\b/i.test(text) ||
    /^(find|show|recommend).*(doctor|specialist)/i.test(text) ||
    SPECIALTY_KEYWORDS.some((s) => s.key.test(text) && /\b(doctor|specialist|see|find|need)\b/i.test(text))
  ) {
    return "find_doctor";
  }

  if (
    /\b(find|search|show|nearby|nearest)\b.*\b(hospital|clinic|facility)\b/i.test(text) ||
    /\b(hospital|clinic)\b.*\b(near|around|in)\b/i.test(text) ||
    /emergency hospital/i.test(text)
  ) {
    return "find_hospital";
  }

  if (
    /\b(my )?(medical )?records?|lab reports?|uploaded files?|prescriptions?|diagnostic scans?\b/i.test(text) ||
    /\b(show|give|get|find|open)\b.*\b(file|report|record|pdf|scan)\b/i.test(text)
  ) {
    return "medical_records";
  }

  if (/\bsymptom|feeling|pain|fever|cough|nausea|dizzy|rash\b/i.test(text)) {
    return "symptoms";
  }

  // Follow-up in booking conversation
  if (
    /\b(book|schedule|appointment)\b/i.test(recent) &&
    (/\b(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(:\d{2})?\s*(am|pm)?)\b/i.test(
      text
    ) ||
      SPECIALTY_KEYWORDS.some((s) => s.key.test(text)) ||
      /\b(doctor|hospital|with|for)\b/i.test(text))
  ) {
    return "book_appointment";
  }

  return "general";
}

function extractSearchHints(message: string): string[] {
  const hints: string[] = [];
  for (const s of SPECIALTY_KEYWORDS) {
    if (s.key.test(message)) hints.push(...s.labels);
  }
  const cityMatch = message.match(/\bin\s+([A-Za-z][A-Za-z\s-]{1,30})\b/i);
  if (cityMatch?.[1]) hints.push(cityMatch[1].trim().toLowerCase());
  return [...new Set(hints)];
}

function matchesHints(row: Record<string, unknown>, hints: string[]): boolean {
  if (hints.length === 0) return true;
  const hay = Object.values(row)
    .flat()
    .join(" ")
    .toLowerCase();
  return hints.some((h) => hay.includes(h.toLowerCase()));
}

function inferFileType(url: string): ChatAttachment["type"] {
  if (/\.(png|jpe?g|gif|webp)$/i.test(url)) return "image";
  if (/\.pdf$/i.test(url)) return "pdf";
  return "file";
}

function pickAttachments(context: PatientContext, intent: Intent, message: string, reply: string): ChatAttachment[] {
  if (intent !== "medical_records" && !/record|lab|report|file|pdf|scan|document/i.test(message + " " + reply)) {
    return [];
  }

  return context.medicalRecords
    .flatMap((r) => {
      const files = (r.attachments as string[]) || [];
      return files.map((url) => ({
        name: String(r.recordName || r.diagnosis || "Medical file"),
        url,
        type: inferFileType(url),
      }));
    })
    .slice(0, 5);
}

function intentInstructions(intent: Intent): string {
  switch (intent) {
    case "book_appointment":
      return `DETECTED INTENT: BOOK A NEW APPOINTMENT
RULES:
- Do NOT list the patient's past or existing appointments unless they explicitly ask for them.
- Help them book a NEW visit.
- Ask only the missing details needed: specialty/reason, preferred doctor (from available doctors), preferred hospital/city, preferred date/time.
- Suggest 3–5 matching doctors from AVAILABLE DOCTORS (not appointment history).
- Tell them they can complete booking on the Appointments page: /dashboard/appointments
- If they already named a specialty or doctor, filter suggestions to that.`;
    case "list_my_appointments":
      return `DETECTED INTENT: LIST MY EXISTING APPOINTMENTS
RULES:
- Summarize THIS patient's appointments from MY APPOINTMENTS only.
- Group by upcoming vs past if possible.
- Do not suggest booking unless they ask.`;
    case "find_doctor":
      return `DETECTED INTENT: FIND DOCTOR
RULES:
- Recommend doctors from AVAILABLE DOCTORS that match the specialty/location in the user question.
- If specialty is unclear, ask one short clarifying question and still show a few top doctors.
- Do NOT dump the patient's appointment history.`;
    case "find_hospital":
      return `DETECTED INTENT: FIND HOSPITAL
RULES:
- Recommend hospitals from AVAILABLE HOSPITALS matching city/type if mentioned.
- Do NOT list appointment history.`;
    case "medical_records":
      return `DETECTED INTENT: MEDICAL RECORDS / FILES
RULES:
- Summarize THIS patient's medical records from MY MEDICAL RECORDS.
- Mention attachment/file names when available.
- Do not invent lab results that are not in the data.`;
    case "symptoms":
      return `DETECTED INTENT: SYMPTOM GUIDANCE
RULES:
- Give careful general guidance only (not a diagnosis).
- Suggest which specialty to see and offer to help find a doctor or book.
- For emergency symptoms, urge urgent care immediately.`;
    default:
      return `DETECTED INTENT: GENERAL
RULES:
- Answer the user's exact question helpfully and briefly.
- Only pull appointment/records/doctors data when relevant to the question.
- Do not dump unrelated lists.`;
  }
}

function buildSystemPrompt(intent: Intent, scoped: Partial<PatientContext> & { profile: PatientContext["profile"] }) {
  return `You are MediConnect AI Health Assistant for logged-in patients.

${intentInstructions(intent)}

GLOBAL RULES:
- Answer ONLY what the user asked. Stay on topic.
- Use ONLY the JSON data below. Never invent doctors, hospitals, appointments, or records.
- Be concise, friendly, and actionable. Prefer short bullets over long paragraphs.
- Keep replies under 180 words unless listing many items.
- You are not a doctor; do not give definitive diagnoses.
- Never reveal other patients' data.

RELEVANT DATA (JSON):
${JSON.stringify(scoped)}`;
}

function mapAppointment(a: any) {
  return {
    id: String(a._id),
    date: a.date,
    time: a.time,
    reason: a.reason,
    status: a.status,
    doctor: a.doctorId?.fullName || a.doctorName || null,
    specialization: a.doctorId?.specialization || null,
    hospital: a.hospitalId?.hospitalName || a.hospitalName || null,
    city: a.hospitalId?.city || null,
  };
}

function mapRecord(r: any) {
  return {
    id: String(r._id),
    recordName: r.recordName || r.diagnosis,
    diagnosis: r.diagnosis,
    dept: r.dept,
    status: r.status,
    format: r.format,
    date: r.date || r.createdAt,
    doctor: r.doctorId?.fullName || null,
    attachments: r.attachments || [],
  };
}

function mapDoctor(d: any) {
  return {
    id: String(d._id),
    fullName: d.fullName,
    specialization: d.specialization,
    department: d.department,
    hospitalName: d.hospitalName,
    rating: d.rating,
    experience: d.experience,
  };
}

function mapHospital(h: any) {
  return {
    id: String(h._id),
    hospitalName: h.hospitalName,
    city: h.city,
    state: h.state,
    type: h.type,
    status: h.status,
    departments: h.departments,
  };
}

export class ChatService {
  async buildPatientContext(userId: string): Promise<PatientContext> {
    const [user, appointments, medicalRecords, doctors, hospitals] = await Promise.all([
      userRepo.findById(userId),
      AppointmentModel.find({ patientId: userId })
        .populate("doctorId", "fullName specialization")
        .populate("hospitalId", "hospitalName city")
        .sort({ date: -1 })
        .limit(30)
        .lean(),
      MedicalRecordModel.find({ patientId: userId })
        .populate("doctorId", "fullName specialization")
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
      DoctorModel.find({ status: "ACTIVE" })
        .select("fullName specialization department hospitalName rating experience status")
        .limit(60)
        .lean(),
      HospitalModel.find()
        .select("hospitalName city state type status departments")
        .limit(40)
        .lean(),
    ]);

    if (!user) throw { status: 404, message: "User not found" };

    return {
      profile: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      appointments: appointments.map(mapAppointment),
      medicalRecords: medicalRecords.map(mapRecord),
      doctors: doctors.map(mapDoctor),
      hospitals: hospitals.map(mapHospital),
    };
  }

  scopeContext(full: PatientContext, intent: Intent, message: string) {
    const hints = extractSearchHints(message);
    const profile = full.profile;

    switch (intent) {
      case "book_appointment": {
        const matchedDoctors = full.doctors.filter((d) => matchesHints(d, hints));
        const doctors = (matchedDoctors.length ? matchedDoctors : full.doctors).slice(0, 5);
        const matchedHospitals = full.hospitals.filter((h) => matchesHints(h, hints));
        const hospitals = (matchedHospitals.length ? matchedHospitals : full.hospitals).slice(0, 4);
        return {
          profile,
          bookingGoal: "Help user book a NEW appointment",
          availableDoctors: doctors,
          availableHospitals: hospitals,
          note: "Do not use past appointments unless the user asks for them.",
        };
      }
      case "list_my_appointments":
        return {
          profile,
          myAppointments: full.appointments.slice(0, 10),
        };
      case "find_doctor": {
        const matched = full.doctors.filter((d) => matchesHints(d, hints));
        return {
          profile,
          searchHints: hints,
          availableDoctors: (matched.length ? matched : full.doctors).slice(0, 6),
        };
      }
      case "find_hospital": {
        const matched = full.hospitals.filter((h) => matchesHints(h, hints));
        return {
          profile,
          searchHints: hints,
          availableHospitals: (matched.length ? matched : full.hospitals).slice(0, 6),
        };
      }
      case "medical_records":
        return {
          profile,
          myMedicalRecords: full.medicalRecords.slice(0, 10),
        };
      case "symptoms":
        return {
          profile,
          tip: "Suggest specialty and offer booking/find-doctor help",
          sampleDoctors: full.doctors.slice(0, 5),
        };
      default:
        return {
          profile,
          availableDoctorsSample: full.doctors.slice(0, 5),
          availableHospitalsSample: full.hospitals.slice(0, 5),
          myAppointmentsCount: full.appointments.length,
          myRecordsCount: full.medicalRecords.length,
        };
    }
  }

  async chat(userId: string, message: string, history: ChatHistoryItem[] = []) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw { status: 500, message: "GEMINI_API_KEY is not configured on the server" };
    }

    const intent = detectIntent(message, history);
    const fullContext = await this.buildPatientContext(userId);
    const scoped = this.scopeContext(fullContext, intent, message);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
      systemInstruction: buildSystemPrompt(intent, scoped as any),
    });

    const guidedUserPrompt =
      intent === "book_appointment"
        ? `User wants to BOOK a new appointment (not view old ones).\nUser message: ${message}`
        : intent === "list_my_appointments"
          ? `User wants to see THEIR existing appointments only.\nUser message: ${message}`
          : intent === "find_doctor"
            ? `User wants doctor recommendations matching their request.\nUser message: ${message}`
            : intent === "find_hospital"
              ? `User wants hospital recommendations matching their request.\nUser message: ${message}`
              : intent === "medical_records"
                ? `User wants their medical records/files.\nUser message: ${message}`
                : message;

    const contents = [
      ...history.slice(-4).map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content.slice(0, 500) }],
      })),
      { role: "user", parts: [{ text: guidedUserPrompt }] },
    ];

    const result = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.4,
      },
    });
    const reply = result.response.text()?.trim();
    if (!reply) {
      throw { status: 502, message: "Empty response from AI" };
    }

    const attachments = pickAttachments(fullContext, intent, message, reply);

    return {
      reply,
      attachments,
      intent,
      actions:
        intent === "book_appointment"
          ? [{ label: "Open Appointments", href: "/dashboard/appointments" }]
          : intent === "medical_records"
            ? [{ label: "Open Medical Records", href: "/dashboard/medical-records" }]
            : [],
      meta: {
        appointmentCount: fullContext.appointments.length,
        recordCount: fullContext.medicalRecords.length,
        doctorCount: fullContext.doctors.length,
        hospitalCount: fullContext.hospitals.length,
      },
    };
  }
}
