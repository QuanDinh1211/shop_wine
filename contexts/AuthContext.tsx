"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/types";
import { toast } from "sonner";

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

  // Hàm kiểm tra token
  const verifyToken = async (token: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      if (!res.ok) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn");
      }

      const { user } = await res.json();
      setUser(user);
      return true;
    } catch (error: any) {
      console.error("Lỗi kiểm tra token:", error.message);
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      logout();
      return false;
    }
  };

  // Kiểm tra token khi tải trang
  useEffect(() => {
    const savedToken = localStorage.getItem("wine-token");

    if (savedToken) {
      setToken(savedToken);
      // Kiểm tra token ngay khi tải
      verifyToken(savedToken).then(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Kiểm tra token định kỳ (mỗi 5 phút)
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        verifyToken(token);
      }, 60 * 60 * 1000); // 5 phút
      return () => clearInterval(interval);
    }
  }, [token]);

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
