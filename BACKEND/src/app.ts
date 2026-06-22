import cors from "cors";
import { errorHandler } from "./middleware/error_handler.middleware";
import express from "express";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
import path from "path";

app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

app.get("/", (_req, res) => {
  res.send("Backend is working");
});

app.use("/api/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use(errorHandler);

export default app;
