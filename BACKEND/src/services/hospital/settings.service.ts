import { HospitalModel } from "../../models/hospital.model";

type SettingsPayload = {
  hospitalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  appointmentAlerts?: boolean;
  checkInAlerts?: boolean;
  recordAlerts?: boolean;
};

export class HospitalSettingsService {
  async get(hospitalId: string) {
    const hospital = await HospitalModel.findById(hospitalId).select("hospitalName email phoneNumber address notificationPreferences");
    if (!hospital) throw { status: 404, message: "Hospital not found" };
    return this.serialize(hospital);
  }

  async update(hospitalId: string, payload: SettingsPayload) {
    const updates: Record<string, unknown> = {};
    if (typeof payload.hospitalName === "string" && payload.hospitalName.trim()) updates.hospitalName = payload.hospitalName.trim();
    if (typeof payload.email === "string" && payload.email.trim()) updates.email = payload.email.trim().toLowerCase();
    if (typeof payload.phone === "string") updates.phoneNumber = payload.phone.trim();
    if (typeof payload.address === "string") updates.address = payload.address.trim();
    for (const key of ["appointmentAlerts", "checkInAlerts", "recordAlerts"] as const) {
      if (typeof payload[key] === "boolean") updates[`notificationPreferences.${key}`] = payload[key];
    }
    const hospital = await HospitalModel.findByIdAndUpdate(hospitalId, { $set: updates }, { new: true, runValidators: true }).select("hospitalName email phoneNumber address notificationPreferences");
    if (!hospital) throw { status: 404, message: "Hospital not found" };
    return this.serialize(hospital);
  }

  private serialize(hospital: any) {
    return {
      hospitalName: hospital.hospitalName,
      email: hospital.email,
      phone: hospital.phoneNumber || "",
      address: hospital.address || "",
      appointmentAlerts: hospital.notificationPreferences?.appointmentAlerts ?? true,
      checkInAlerts: hospital.notificationPreferences?.checkInAlerts ?? true,
      recordAlerts: hospital.notificationPreferences?.recordAlerts ?? true,
    };
  }
}
