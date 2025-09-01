import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import apiRouter from "./routes";
import { Server as SocketIOServer } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./ws/socket";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

// Backend

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());

  // Rate limiting to prevent brute-force attacks
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per windowMs
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  });
  app.use(limiter);

  app.use((req: Request, res: Response, next: NextFunction) => {
    req.io = req.app.get("socketio");
    next();
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/v1", apiRouter);

  return app;
};

declare global {
  namespace Express {
    interface Request {
      io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
    }
  }
}
