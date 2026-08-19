// src/app/page.js
// ─── Phase 1 Home Page ───────────────────────────────────────
// Simple landing page that directs users to the registration form.

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center max-w-2xl">
        {/* Hero Icon */}
        <div className="text-6xl mb-6">💼</div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            CareerHub
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
          Your full-stack job board connecting employers with talented job
          seekers. Get started by creating your account.
        </p>

        {/* CTA */}
        <Link
          href="/auth/register"
          className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-lg hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 hover:-translate-y-0.5"
        >
          Create an Account →
        </Link>

        {/* Phase indicator */}
        <div className="mt-16 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 ring-4 ring-sky-500/20" />
            <span className="text-sm font-medium text-sky-400">Phase 1</span>
          </div>
          <span className="text-slate-600">—</span>
          <span className="text-sm text-slate-500">User Registration</span>
        </div>
      </div>
    </div>
  );
}
