
import { z } from "zod";
import axios from "axios";
import { type Comment } from "../../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export const createCommentSchema = z.object({
  taskId: z.string(),
  body: z.string().min(1, "Comment body cannot be empty"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export async function getComments(taskId: string): Promise<Comment[]> {
  const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    headers: getAuthHeader(),
  });
  return response.data.comments;
}

export async function createComment(data: CreateCommentInput): Promise<Comment> {
  const response = await axios.post(`${API_BASE_URL}/tasks/${data.taskId}/comments`, data, {
    headers: getAuthHeader(),
  });
  return response.data.comment;
}
