// src/app/layout.js
// ─── Root Layout ──────────────────────────────────────────────
// Wraps all pages with the shared Navbar, Footer, global styles, and metadata.

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CareerHub — Find Your Next Opportunity",
  description:
    "CareerHub is a full-stack job board connecting employers with talented job seekers. Post jobs, submit applications, and manage your career — all in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
