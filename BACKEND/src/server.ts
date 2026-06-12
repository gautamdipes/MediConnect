import "dotenv/config";
import app from "./app";
import { connectDB } from "./database/mongodb";
import { PORT } from "./config/constant";

const startServer = async (): Promise<void> => {
  console.log("Starting MediConnect backend...");
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
