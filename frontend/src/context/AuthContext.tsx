import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import { tokenStore } from "../utils/tokenStore";
import type { User, LoginCredentials, RegisterData } from "../types/index";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to get a fresh access token via the refresh cookie, then load user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.post("/auth/refresh-token", {});
        const { accessToken } = res.data;
        tokenStore.set(accessToken);
        const meRes = await api.get("/users/me");
        setUser(meRes.data.data.user);
      } catch {
        tokenStore.clear();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const setToken = async (token: string) => {
    tokenStore.set(token);
    try {
      const res = await api.get("/users/me");
      setUser(res.data.data.user);
    } catch (error) {
      tokenStore.clear();
      setUser(null);
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const res = await api.post("/auth/login", credentials);
    const { data, tokens } = res.data;
    tokenStore.set(tokens.accessToken);
    setUser(data.sanitizedUser);
  };

  // register does NOT log the user in — they must verify their email first
  const register = async (userData: RegisterData) => {
    await api.post("/auth/signup", userData);
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    } finally {
      tokenStore.clear();
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
        updateUser,
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
