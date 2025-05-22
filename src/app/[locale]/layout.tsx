import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, locales } from "@/lib/i18n";
import "../../app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params?.locale;
  const messages = await getMessages(locale);

  return (
    <Providers>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="app-theme"
          disableTransitionOnChange
        >
          <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
            <Header />
            <main className="flex-1 container mx-auto py-6 px-4">
              {children}
            </main>
            <Toaster />
          </div>
        </ThemeProvider>
      </NextIntlClientProvider>
    </Providers>
  );
} 