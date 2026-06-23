import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediConnect",
  description: "Clinical workflow and hospital operations platform.",
};

import { AuthContextProvider } from "@/app/dashboard/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
