import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
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

  const login = async (credentials: any) => {
    // Backend returns: { status, message, data: { sanitizedUser }, tokens: { accessToken, refreshToken } }
    const res = await api.post("/auth/login", credentials);
    const { data, tokens } = res.data;
    localStorage.setItem("accessToken", tokens.accessToken);
    setUser(data.sanitizedUser);
  };

  const register = async (userData: any) => {
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
