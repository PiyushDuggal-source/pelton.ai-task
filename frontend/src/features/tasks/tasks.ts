
import { z } from "zod";
import axios from "axios";
import { type Task } from "../../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export const createTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  assigneeId: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional().default("todo"),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "done"]),
});

export const getTasksFilterSchema = z.object({
  assigneeId: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type GetTasksFilterInput = z.infer<typeof getTasksFilterSchema>;

export async function getTasks(projectId: string, filters?: GetTasksFilterInput): Promise<Task[]> {
  const response = await axios.get(`${API_BASE_URL}/tasks/project/${projectId}/tasks`, {
    headers: getAuthHeader(),
    params: filters,
  });
  return response.data.tasks;
}

export async function getTaskById(taskId: string): Promise<Task> {
  const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`, {
    headers: getAuthHeader(),
  });
  return response.data.task;
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const response = await axios.post(`${API_BASE_URL}/tasks/project/${data.projectId}/tasks`, data, {
    headers: getAuthHeader(),
  });
  return response.data.task;
}

export async function updateTask(taskId: string, data: UpdateTaskInput): Promise<Task> {
  const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, data, {
    headers: getAuthHeader(),
  });
  return response.data.task;
}

export async function updateTaskStatus(taskId: string, data: UpdateTaskStatusInput): Promise<Task> {
  const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}/status`, data, {
    headers: getAuthHeader(),
  });
  return response.data.task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
    headers: getAuthHeader(),
  });
}
