import cors from "cors";
import express from "express";
import path from "path";

import { errorHandler } from "./middleware/error_handler.middleware";

// Routes
import userRoutes          from "./routes/user.routes";
import { authRouter as authRoutes } from "./routes/auth.routes";
import medicalRecordRoutes from "./routes/medical-record.routes";

// Admin Routes
import adminUserRoutes        from "./routes/admin/user.route";
import adminHospitalRoutes    from "./routes/admin/hospital.route";
import adminDoctorRoutes      from "./routes/admin/doctor.route";
import adminAppointmentRoutes from "./routes/admin/appointment.route";
import adminOverviewRoutes    from "./routes/admin/overview.route";
import publicRoutes           from "./routes/public.routes";
import adminChatRoutes        from "./routes/admin/chat.route";

// Hospital Routes
import hospitalAuthRoutes     from "./routes/hospital/auth.route";
import hospitalDashboardRoutes from "./routes/hospital/dashboard.route";
import hospitalPatientRoutes   from "./routes/hospital/patient.route";
import hospitalAppointmentRoutes from "./routes/hospital/appointment.route";
import hospitalSettingsRoutes from "./routes/hospital/settings.route";
import hospitalNotificationRoutes from "./routes/hospital/notification.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/", (_req, res) => {
  res.send("Backend is working");
});

// Public routes
app.use("/api/v1/public",             publicRoutes);
app.use("/api/v1/users",              userRoutes);
app.use("/api/v1/auth",               authRoutes);
app.use("/api/v1/medical-records",    medicalRecordRoutes);

// Admin routes
app.use("/api/v1/admin/users",        adminUserRoutes);
app.use("/api/v1/admin/hospitals",    adminHospitalRoutes);
app.use("/api/v1/admin/doctors",      adminDoctorRoutes);
app.use("/api/v1/admin/appointments", adminAppointmentRoutes);
app.use("/api/v1/admin/overview",     adminOverviewRoutes);
app.use("/api/v1/admin/chat",         adminChatRoutes);

// Hospital routes
app.use("/api/v1/hospital",           hospitalAuthRoutes);
app.use("/api/v1/hospital/dashboard", hospitalDashboardRoutes);
app.use("/api/v1/hospital/patients",  hospitalPatientRoutes);
app.use("/api/v1/hospital/appointments", hospitalAppointmentRoutes);
app.use("/api/v1/hospital/settings", hospitalSettingsRoutes);
app.use("/api/v1/hospital/notifications", hospitalNotificationRoutes);

app.use(errorHandler);

export default app;
