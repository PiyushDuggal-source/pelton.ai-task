import {  type Task, type Comment, type Attachment } from "./api";

export interface ServerToClientEvents {
  connected: (payload: { ok: boolean }) => void;
  "task:create": (payload: { task: Task }) => void;
  "task:update": (payload: { task: Task }) => void;
  "task:delete": (payload: { taskId: string }) => void;
  "task:status": (payload: { taskId: string; status: string }) => void;
  "comment:create": (payload: { comment: Comment }) => void;
  "attachment:add": (payload: { attachment: Attachment }) => void;
  "attachment:remove": (payload: { attachmentId: string }) => void;
}

export interface ClientToServerEvents {
  "project:join": (payload: { projectId: string }) => void;
}
