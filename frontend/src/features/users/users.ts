import axios from "axios";
import { type User } from "../../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export async function getUsers(): Promise<User[]> {
  const response = await axios.get(`${API_BASE_URL}/users`, {
    headers: getAuthHeader(),
  });
  return response.data.users;
}
