// src/components/Footer.jsx
// ─── Phase 1 Site Footer ──────────────────────────────────────
// Simplified footer for the registration-only phase.

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <span className="text-2xl">💼</span>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                CareerHub
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Connecting talented professionals with their next career
              opportunity. Find jobs, hire talent, and grow your career.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Get Started
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-500 hover:text-sky-400 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-sm text-slate-500 hover:text-sky-400 transition-colors duration-200"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Bottom */}
        <div className="mt-10 pt-8 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} CareerHub. Built with Next.js, Prisma
              &amp; PostgreSQL.
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
