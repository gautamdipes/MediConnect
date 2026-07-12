import cors from "cors";
import { errorHandler } from "./middleware/error_handler.middleware";
import express from "express";
import userRoutes from "./routes/user.routes";
import { authRouter as authRoutes } from "./routes/auth.routes";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

app.get("/", (_req, res) => {
  res.send("Backend is working");
});

// Route Configurations
app.use("/api/users", userRoutes);
app.use("/api/v1/auth", authRoutes);

// ✅ Wrapped lazily to prevent medical-records crash
app.use("/api/medical-records", (req, res, next) => {
  const routerModule = require("./routes/medical-record.routes");
  const router = routerModule.default || routerModule.medicalRecordRoutes || routerModule.router;
  if (typeof router === "function") {
    router(req, res, next);
  } else {
    next(new Error("Medical records router failed to load. Make sure it exports an express router."));
  }
});

// Admin Configurations (Wrapped lazily)
app.use("/api/v1/admin/users", (req, res, next) => {
  const router = require("./routes/admin/user.route").default;
  router(req, res, next);
});

app.use("/api/v1/admin/hospitals", (req, res, next) => {
  const router = require("./routes/admin/hospital.route").default;
  router(req, res, next);
});

app.use(errorHandler);

export default app;