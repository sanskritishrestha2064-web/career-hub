"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function SeekerDashboardPage() {
  const [userName, setUserName] = useState("Sanskriti");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applications"); // "applications" | "saved"

  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchSeekerData = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch dashboard data
      const res = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.applications) setApplications(data.data.applications);
        if (data.data.savedJobs) setSavedJobs(data.data.savedJobs);
      }

      // 2. Fetch profile data for name and completion
      const profRes = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profData = await profRes.json();
      if (profData.success && profData.data) {
        setProfile(profData.data);
        if (profData.data.name) {
          setUserName(profData.data.name.split(" ")[0]);
        }
      }
    } catch (err) {
      console.error("Seeker dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeekerData();
  }, []);

  // Compute stats
  const totalApplied = applications.length;
  const totalPending = applications.filter(
    (a) => a.status === "PENDING" || !a.status
  ).length;
  const totalInterviews = applications.filter(
    (a) => a.status === "INTERVIEW" || a.status === "SHORTLISTED"
  ).length;

  // Calculate profile completion
  const calculateCompletion = () => {
    if (!profile) return 60;
    let score = 0;
    if (profile.name) score += 15;
    if (profile.headline) score += 15;
    if (profile.about) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.experience) score += 15;
    if (profile.resumeUrl || profile.resumeName) score += 20;
    return Math.min(100, Math.max(20, score));
  };

  const completionPct = calculateCompletion();

  const getStatusBadge = (status) => {
    switch (status) {
      case "SHORTLISTED":
        return { text: "Shortlisted", bg: "bg-purple-500/15 text-purple-300 border-purple-500/30" };
      case "INTERVIEW":
        return { text: "Interview", bg: "bg-sky-500/15 text-sky-300 border-sky-500/30" };
      case "APPROVED":
        return { text: "Accepted", bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
      case "REJECTED":
      case "DECLINED":
        return { text: "Rejected", bg: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
      case "PENDING":
      default:
        return { text: "Pending", bg: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-slate-950 text-slate-100">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-sky-500/50 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up backdrop-blur-md">
          <span className="text-sky-400 font-semibold">ℹ</span>
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <span className="font-semibold text-slate-300">Seeker Dashboard</span>
              <span>└──</span>
              <span className="text-sky-400 font-bold">Overview</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track your submitted applications, interview stages, and saved positions
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/profile"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-all flex items-center gap-2"
            >
              <span>👤</span> View Profile
            </Link>
            <Link
              href="/jobs"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/20 flex items-center gap-1.5"
            >
              <span>🔍</span> Browse Jobs
            </Link>
          </div>
        </div>

        {/* ─── Stats Cards Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Applied */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Applied
              </span>
              <span className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center text-sm font-bold">
                📝
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
              {totalApplied || 12}
            </div>
            <p className="text-xs text-slate-500">Total job applications submitted</p>
          </div>

          {/* Card 2: Pending */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pending
              </span>
              <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-sm font-bold">
                ⏳
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-1">
              {totalPending || 4}
            </div>
            <p className="text-xs text-slate-500">Awaiting employer review</p>
          </div>

          {/* Card 3: Interviews */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Interviews
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm font-bold">
                🎯
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">
              {totalInterviews || 2}
            </div>
            <p className="text-xs text-slate-500">Shortlisted / Scheduled calls</p>
          </div>
        </div>

        {/* ─── Profile Completion Widget ───────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Profile Completion</span>
                <span className="text-xs text-sky-400 font-bold bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/30">
                  {completionPct}%
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {completionPct < 100 ? "Add resume to reach 100%" : "Profile 100% complete! ✨"}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
              <div
                className="bg-linear-to-r from-sky-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <Link
            href="/profile"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold border border-slate-700 transition-all shrink-0"
          >
            Complete Profile →
          </Link>
        </div>

        {/* ─── Tabs: Applications vs Saved Jobs ─────────────────────── */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "applications"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span>📝</span>
            <span>Recent Applications ({applications.length || 3})</span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "saved"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span>♥</span>
            <span>Saved Jobs ({savedJobs.length})</span>
          </button>
        </div>

        {/* ─── TAB 1: RECENT APPLICATIONS ───────────────────────────── */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">Recent Applications</h2>

            {/* Display active applications or demo fallback items */}
            {(applications.length > 0 ? applications : [
              {
                id: "demo-1",
                job: { title: "Frontend Developer", company: "ABC Technologies", location: "Kathmandu • Remote" },
                status: "PENDING",
                createdAt: new Date().toISOString(),
                yearsOfExperience: "2 years",
                resumeName: "Resume.pdf",
              },
              {
                id: "demo-2",
                job: { title: "Backend Developer", company: "CloudCraft Inc.", location: "Kathmandu • Remote" },
                status: "SHORTLISTED",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                yearsOfExperience: "3 years",
                resumeName: "Resume.pdf",
              },
              {
                id: "demo-3",
                job: { title: "UI/UX Designer", company: "DesignSphere Studio", location: "Pokhara • Hybrid" },
                status: "INTERVIEW",
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                yearsOfExperience: "2 years",
                resumeName: "Resume.pdf",
              },
            ]).map((app) => {
              const badge = getStatusBadge(app.status);

              return (
                <div
                  key={app.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-white">
                        {app.job?.title || "Frontend Developer"}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}
                      >
                        {badge.text}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">
                      {app.job?.company || "ABC Technologies"} • {app.job?.location || "Kathmandu"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>📄 {app.resumeName || "Resume.pdf"}</span>
                      <span>•</span>
                      <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href="/jobs"
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
                    >
                      View Role
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TAB 2: SAVED JOBS ────────────────────────────────────── */}
        {activeTab === "saved" && (
          <div>
            {savedJobs.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
                <div className="text-5xl mb-4">♥</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Saved Jobs Yet
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                  Browse open positions and click &quot;♡ Save&quot; on jobs you are interested in.
                </p>
                <Link
                  href="/jobs"
                  className="inline-block px-6 py-3 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
                >
                  Explore Jobs →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {savedJobs.map((job) => (
                  <div
                    key={job.savedRecordId || job.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {job.title}
                        </h3>
                        <p className="text-slate-400 text-sm mb-2">
                          {job.company} • {job.location} • {job.workplaceType || "Remote"}
                        </p>
                        <p className="text-emerald-400 font-bold text-sm">
                          💰 {job.salaryFormatted || `Rs. ${(job.salary || 50000).toLocaleString()}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href="/jobs"
                          className="px-4 py-2 rounded-xl bg-linear-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold shadow-md shadow-sky-500/10"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
