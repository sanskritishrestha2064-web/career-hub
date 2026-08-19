"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutHandler } from "@/app/actions/auth";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hasToken, setHasToken] = useState(null);
  const router = useRouter();

  // const [hasToken, setHasToken] = useState(() => {
  //   if (typeof window !== "undefined") return localStorage.getItem("token");
  // });

  // const hasToken =
  //   typeof window !== "undefined" && localStorage.getItem("token");
  // Scroll detection for glass effect

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(token);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => pathname === path;

  // localStorage -> get / set -> this code is being directly run on server

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/10"
          : "bg-slate-900 border-b border-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
              💼
            </span>
            <span className="text-xl font-bold bg-linear-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent group-hover:from-sky-300 group-hover:to-blue-400 transition-all">
              CareerHub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            <Link
              href="/jobs"
              className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all ${
                isActive("/jobs")
                  ? "bg-sky-500/15 text-sky-400 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Jobs
            </Link>

            {hasToken && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all ${
                    pathname.startsWith("/dashboard")
                      ? "bg-sky-500/15 text-sky-400 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/profile"
                  className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all ${
                    pathname.startsWith("/profile")
                      ? "bg-sky-500/15 text-sky-400 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Profile
                </Link>
              </>
            )}

            <Link
              href="/auth/register"
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${hasToken && "hidden"} ${
                isActive("/auth/register")
                  ? "bg-sky-500/15 text-sky-400"
                  : "bg-linear-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/10"
              }`}
            >
              Register
            </Link>

            <Link
              href="/auth/login"
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${
                isActive("/auth/login")
                  ? "bg-sky-500/15 text-sky-400"
                  : "bg-linear-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/10"
              }`}
              onClick={
                hasToken
                  ? async () => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      const result = await logoutHandler();
                      if (result?.error) {
                        alert("Error logging out");
                        return;
                      }
                      router.push(result.redirectTo);
                      router.refresh();
                    }
                  : () => {}
              }
            >
              {hasToken ? "Log Out" : "Log In"}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
