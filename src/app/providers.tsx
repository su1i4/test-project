"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isMswReady, setIsMswReady] = useState(false);

  useEffect(() => {
    async function initMsw() {
      if (process.env.NODE_ENV === "development") {
        try {
          const { worker } = await import("@/mocks/browser");
          await worker.start({
            onUnhandledRequest: "bypass",
          });
        } catch (error) {
          console.error("Ошибка при инициализации MSW:", error);
        }
      }
      setIsMswReady(true);
    }

    initMsw();
  }, []);

  if (!isMswReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-lg">Инициализация приложения...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 