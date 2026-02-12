import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getSession } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Comrade CRM | Enquiry Management System",
  description: "Advanced enquiry management, scheduling, and staff performance tracking.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app-container">
          {session && <Sidebar user={session} />}
          <main className={session ? "main-content" : "full-content"}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
