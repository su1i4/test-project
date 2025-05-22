"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiClient, UserProfile } from "@/lib/api";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const { token, setUser } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", token],
    queryFn: () =>
      token ? apiClient.getProfile(token) : Promise.reject("Нет токена"),
    enabled: !!token,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateLocale = locale === "ru" ? ru : enUS;

    return format(date, "PPP", { locale: dateLocale });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">{t("loading")}</h2>
          <div className="animate-pulse bg-primary/20 h-2 w-24 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-destructive">
            {t("error")}
          </h2>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">{t("error")}</h2>
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("profileInfo")}</CardTitle>
          <CardDescription>{t("profileDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-muted-foreground">{t("email")}</p>
              <p className="text-lg">{data.email}</p>
            </div>

            {data.registrationDate && (
              <div>
                <p className="font-medium text-muted-foreground">
                  {t("registrationDate")}
                </p>
                <p className="text-lg">{formatDate(data.registrationDate)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("subscriptions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.subscriptions && data.subscriptions.length > 0 ? (
            <ul className="space-y-2">
              {data.subscriptions.map((subscription, index) => (
                <li key={index} className="p-3 bg-secondary/50 rounded-lg">
                  {subscription}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t("noSubscriptions")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
