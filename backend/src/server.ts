import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { configureSocketIO } from "./ws/socket";
import { connectToDatabase } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function bootstrap() {
  const app = createApp();
  const httpServer = createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] },
  });

  app.set("socketio", io);

  configureSocketIO(io);

  const mongoUri = process.env.MONGODB_URI ?? "";
  await connectToDatabase(mongoUri);

  httpServer.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});