import axiosInstance from "./axios-instance";

const config = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("hospitalToken") || ""}` } });

export const getHospitalPatients = () => axiosInstance.get("/api/v1/hospital/patients?limit=100", config()).then((response) => response.data);
export const createHospitalPatient = (data: Record<string, unknown>) => axiosInstance.post("/api/v1/hospital/patients", data, config()).then((response) => response.data);
export const getHospitalAppointments = () => axiosInstance.get("/api/v1/hospital/appointments", config()).then((response) => response.data);
export const createHospitalAppointment = (data: Record<string, unknown>) => axiosInstance.post("/api/v1/hospital/appointments", data, config()).then((response) => response.data);
export const updateHospitalAppointmentStatus = (id: string, status: string) => axiosInstance.patch(`/api/v1/hospital/appointments/${id}/status`, { status }, config()).then((response) => response.data);
export const getHospitalDashboard = () => axiosInstance.get("/api/v1/hospital/dashboard", config()).then((response) => response.data);
export const getHospitalSettings = () => axiosInstance.get("/api/v1/hospital/settings", config()).then((response) => response.data);
export const updateHospitalSettings = (data: Record<string, unknown>) => axiosInstance.patch("/api/v1/hospital/settings", data, config()).then((response) => response.data);
export const getHospitalNotifications = () => axiosInstance.get("/api/v1/hospital/notifications", config()).then((response) => response.data);
export const markHospitalNotificationRead = (id: string) => axiosInstance.patch(`/api/v1/hospital/notifications/${id}/read`, {}, config()).then((response) => response.data);
export const markAllHospitalNotificationsRead = () => axiosInstance.patch("/api/v1/hospital/notifications/read-all", {}, config()).then((response) => response.data);
