import React, { createContext, useState, useContext, useEffect } from "react";
import { type User } from "../types/api";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken"),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (_) {
          localStorage.removeItem("accessToken");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    verifyToken();
  }, [token]);

  const login = (accessToken: string, user: User) => {
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
