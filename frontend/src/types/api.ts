
export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  deadline?: string;
  ownerId: string;
  memberIds: string[];
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Attachment {
  _id: string;
  taskId: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
}
