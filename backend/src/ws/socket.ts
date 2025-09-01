import { Server as IOServer, Socket } from "socket.io";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";

declare module "socket.io" {
  interface Socket {
    user?: JwtPayload;
  }
}

export type ServerToClientEvents = {
  connected: (payload: { ok: boolean }) => void;
  "task:create": (payload: { task: any }) => void;
  "task:update": (payload: { task: any }) => void;
  "task:delete": (payload: { taskId: string }) => void;
  "task:status": (payload: { taskId: string; status: string }) => void;
  "comment:create": (payload: { comment: any }) => void;
  "attachment:add": (payload: { attachment: any }) => void;
  "attachment:remove": (payload: { attachmentId: string }) => void;
};

export type ClientToServerEvents = {
  "project:join": (payload: { projectId: string }) => void;
};

export function configureSocketIO(
  io: IOServer<ClientToServerEvents, ServerToClientEvents>
) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.user = payload;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on(
    "connection",
    (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      socket.emit("connected", { ok: true });

      socket.on("project:join", ({ projectId }) => {
        socket.join(`project:${projectId}`);
      });
    }
  );
}
