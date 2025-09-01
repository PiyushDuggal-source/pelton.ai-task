
import { z } from "zod";
import axios from "axios";
import { type AuthResponse } from "../../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export async function login(data: LoginInput): Promise<AuthResponse> {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
  return response.data;
}

export async function register(data: RegisterInput): Promise<AuthResponse> {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
  return response.data;
}
