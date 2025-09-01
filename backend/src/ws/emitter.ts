
import { Server } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents } from "./socket";

export const createSocketEmitter = (
  io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
  return {
    emitTaskCreate: (projectId: string, task: any) => {
      io.to(`project:${projectId}`).emit("task:create", { task });
    },
    emitTaskUpdate: (projectId: string, task: any) => {
      io.to(`project:${projectId}`).emit("task:update", { task });
    },
    emitTaskDelete: (projectId: string, taskId: string) => {
      io.to(`project:${projectId}`).emit("task:delete", { taskId });
    },
    emitTaskStatusUpdate: (projectId: string, taskId: string, status: string) => {
      io.to(`project:${projectId}`).emit("task:status", { taskId, status });
    },
    emitCommentCreate: (projectId: string, comment: any) => {
      io.to(`project:${projectId}`).emit("comment:create", { comment });
    },
    emitAttachmentAdd: (projectId: string, attachment: any) => {
      io.to(`project:${projectId}`).emit("attachment:add", { attachment });
    },
    emitAttachmentRemove: (projectId: string, attachmentId: string) => {
      io.to(`project:${projectId}`).emit("attachment:remove", { attachmentId });
    },
  };
};
