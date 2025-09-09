import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { serve } from "inngest/express";
import { inngest} from "./inngest";
import { logger } from "./utils/logger";
import { functions as inngestFunctions } from "./inngest/functions";
import { connectDB } from "./utils/db";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // HTTP request logger


//Set up Inngest endpoint
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions })
);


app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/api/mood", moodRouter);
app.use("/api/activity", activityRouter);
app.use(errorHandler);


app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

app.get("/api/chat", (req: Request, res: Response) => {
    res.send("How may i help u");
  });

  const startServer = async () => {
    try {
      // Connect to MongoDB first
      await connectDB();
  
      // Then start the server
      const PORT = process.env.PORT || 3001;
      app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(
          `Inngest endpoint available at http://localhost:${PORT}/api/inngest`
        );
      });
    } catch (error) {
      logger.error("Failed to start server:", error);
      process.exit(1);
    }
  };
  
  startServer();