"use client";

import { useEffect } from "react";
import { useAuth } from "./auth";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
    }
  }, [isAuthenticated, router, locale]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
