import axiosInstance from "./axios-instance";

const config = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("hospitalToken") || ""}` } });

export const getHospitalPatients = () => axiosInstance.get("/api/v1/hospital/patients?limit=100", config()).then((response) => response.data);
export const createHospitalPatient = (data: Record<string, unknown>) => axiosInstance.post("/api/v1/hospital/patients", data, config()).then((response) => response.data);
export const getHospitalAppointments = () => axiosInstance.get("/api/v1/hospital/appointments", config()).then((response) => response.data);
export const createHospitalAppointment = (data: Record<string, unknown>) => axiosInstance.post("/api/v1/hospital/appointments", data, config()).then((response) => response.data);
export const updateHospitalAppointmentStatus = (id: string, status: string) => axiosInstance.patch(`/api/v1/hospital/appointments/${id}/status`, { status }, config()).then((response) => response.data);
export const getHospitalDashboard = () => axiosInstance.get("/api/v1/hospital/dashboard", config()).then((response) => response.data);
