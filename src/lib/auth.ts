"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Cookies from "js-cookie";

interface AuthState {
  token: string | null;
  user: {
    email: string | null;
    registrationDate?: string;
    subscriptions?: string[];
  } | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

const setCookieToken = (token: string | null) => {
  if (token) {
    Cookies.set("auth-token", token, { expires: 7, path: "/" });
  } else {
    Cookies.remove("auth-token", { path: "/" });
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setToken: (token) => {
        setCookieToken(token);
        set({ token, isAuthenticated: !!token });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        setCookieToken(null);
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: !!state.token,
      }),
    }
  )
);

export function useAuth() {
  const {
    token,
    user,
    isAuthenticated,
    setToken,
    setUser,
    logout: logoutStore,
  } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  const register = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка регистрации");
      }

      toast.success("Регистрация успешна");
      router.push(`/${locale}/auth/login`);
      return true;
    } catch (error) {
      toast.error((error as Error).message || "Ошибка регистрации");
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка входа");
      }

      const data = await response.json();
      setToken(data.token);
      toast.success("Вход выполнен успешно");
      router.push(`/${locale}/profile`);
      return true;
    } catch (error) {
      toast.error((error as Error).message || "Ошибка входа");
      return false;
    }
  };

  const logout = () => {
    logoutStore();
    toast.success("Выход выполнен");
    router.push(`/${locale}/auth/login`);
  };

  const fetchUserProfile = async () => {
    try {
      if (!token) {
        throw new Error("Не авторизован");
      }

      const response = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка получения профиля");
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Ошибка при загрузке профиля:", error);
      return null;
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    register,
    login,
    logout,
    fetchUserProfile,
    setUser,
  };
}
