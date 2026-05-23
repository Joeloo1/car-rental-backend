import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import type { User, LoginCredentials, RegisterData } from "../types/index";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const res = await api.get("/users/me");
          setUser(res.data.data.user);
        }
      } catch (error) {
        // Silently clear invalid token
        console.log("Auth check failed, clearing token");
        localStorage.removeItem("accessToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const setToken = async (token: string) => {
    localStorage.setItem("accessToken", token);
    try {
      const res = await api.get("/users/me");
      setUser(res.data.data.user);
    } catch (error) {
      localStorage.removeItem("accessToken");
      setUser(null);
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    // Backend returns: { status, message, data: { sanitizedUser }, tokens: { accessToken, refreshToken } }
    const res = await api.post("/auth/login", credentials);
    const { data, tokens } = res.data;
    localStorage.setItem("accessToken", tokens.accessToken);
    setUser(data.sanitizedUser);
  };

  const register = async (userData: RegisterData) => {
    // Backend returns: { status, message, data: { newUser }, token: { accessToken, refreshToken } }
    const res = await api.post("/auth/signup", userData);
    const { data, token } = res.data;
    localStorage.setItem("accessToken", token.accessToken);
    setUser(data.newUser);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setToken,
      }}
    >
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
