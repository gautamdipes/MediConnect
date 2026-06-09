import cors from "cors";
import express from "express";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Backend is working");
});

app.use("/api/users", userRoutes);

export default app;
