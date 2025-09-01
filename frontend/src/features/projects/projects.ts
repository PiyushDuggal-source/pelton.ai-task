import { z } from "zod";
import axios from "axios";
import { type Project } from "../../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  deadline: z.iso.datetime().optional().nullable(),
});

export const joinProjectSchema = z.object({
  inviteCode: z.string().min(4, "Invite code is required"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type JoinProjectInput = z.infer<typeof joinProjectSchema>;

export async function getProjects(): Promise<Project[]> {
  const response = await axios.get(`${API_BASE_URL}/projects`, {
    headers: getAuthHeader(),
  });
  return response.data.projects;
}

export async function createProject(
  data: CreateProjectInput,
): Promise<Project> {
  const response = await axios.post(`${API_BASE_URL}/projects`, data, {
    headers: getAuthHeader(),
  });
  return response.data.project;
}

export async function joinProject(data: JoinProjectInput): Promise<Project> {
  const response = await axios.post(`${API_BASE_URL}/projects/join`, data, {
    headers: getAuthHeader(),
  });
  return response.data.project;
}
