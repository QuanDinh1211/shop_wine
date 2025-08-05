"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<{
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("wine-user");
    const savedToken = localStorage.getItem("wine-token");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedToken) {
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        return false;
      }

      const result = await res.json();
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem("wine-user", JSON.stringify(result.user));
      localStorage.setItem("wine-token", result.token);
      return true;
    } catch (error: any) {
      console.error("Login error:", error.message);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      if (!res.ok) {
        const { error } = await res.json();
        return false;
      }

      const result = await res.json();
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem("wine-user", JSON.stringify(result.user));
      localStorage.setItem("wine-token", result.token);
      return true;
    } catch (error: any) {
      console.error("Signup error:", error?.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("wine-user");
    localStorage.removeItem("wine-token");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
