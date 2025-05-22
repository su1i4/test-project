import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Test Project - Next.js App",
  description: "A test project with Next.js, TypeScript, and Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
