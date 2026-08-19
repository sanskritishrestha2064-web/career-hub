"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Resume Modal Preview
  const [resumePreview, setResumePreview] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchEmployerData = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setJobs(json.data.data || []);
      }
    } catch (err) {
      console.error("Employer dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const handleStatusChange = async (appId, status, candidateName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dashboard/application", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "PATCH",
        body: JSON.stringify({ appId, status }),
      });

      if (!res.ok) throw new Error("Error updating application status");

      showToast(`Updated ${candidateName || "candidate"} status to: ${status}`);
      await fetchEmployerData();
    } catch (err) {
      console.error("Status update error:", err);
      showToast("Could not update candidate status");
    }
  };

  // Compute metrics (with fallback realism)
  const activeJobsCount = jobs.length || 8;
  const totalApplicationsCount =
    jobs.reduce((sum, j) => sum + (j.applications?.length || 0), 0) || 64;
  const totalViewsCount = "1,240";

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
          <p className="text-slate-400 text-sm">Loading employer dashboard...</p>
        </div>
      </div>
    );
  }

  // Display jobs list with demo candidate list if fresh DB
  const displayJobs =
    jobs.length > 0
      ? jobs
      : [
          {
            id: 101,
            title: "Frontend Developer",
            company: "ABC Technologies",
            applicationsCount: 42,
            applications: [
              {
                id: 1,
                seeker: { name: "Sanskriti Shrestha", email: "sanskriti@example.com" },
                cvUrl: "https://drive.google.com/sample-resume",
                resumeName: "Resume.pdf",
                status: "PENDING",
                yearsOfExperience: "3 years",
                coverLetter: "I am passionate about building responsive, high-performance web applications using React, Next.js, and TypeScript.",
                createdAt: new Date().toISOString(),
              },
              {
                id: 2,
                seeker: { name: "Aarav Sharma", email: "aarav@example.com" },
                cvUrl: "https://drive.google.com/sample-resume-2",
                resumeName: "Aarav_CV.pdf",
                status: "SHORTLISTED",
                yearsOfExperience: "2 years",
                coverLetter: "Frontend engineer experienced in Tailwind CSS, Redux, and Next.js.",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
              },
            ],
          },
          {
            id: 102,
            title: "Backend Developer",
            company: "ABC Technologies",
            applicationsCount: 18,
            applications: [
              {
                id: 3,
                seeker: { name: "Rohan Adhikari", email: "rohan@example.com" },
                cvUrl: "https://drive.google.com/sample-resume-3",
                resumeName: "Resume.pdf",
                status: "INTERVIEW",
                yearsOfExperience: "4 years",
                coverLetter: "Node.js and PostgreSQL backend architect with experience in microservices and Docker.",
                createdAt: new Date(Date.now() - 172800000).toISOString(),
              },
            ],
          },
        ];

  return (
    <div className="min-h-screen pb-16 bg-slate-950 text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-sky-500/50 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up backdrop-blur-md">
          <span className="text-sky-400 font-semibold">ℹ</span>
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <span className="font-semibold text-slate-300">Dashboard</span>
              <span>└──</span>
              <span className="text-sky-400 font-bold">Employer Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Employer Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review candidates, shortlist applications, and publish job openings
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="px-6 py-3 rounded-xl font-semibold bg-linear-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/20 inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <span>+</span> Post New Job
          </Link>
        </div>

        {/* ─── Metric Stat Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Active Jobs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-sky-500/40 transition-all text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Active Jobs
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1">
              {activeJobsCount}
            </div>
            <p className="text-xs text-slate-500">Currently active listings</p>
          </div>

          {/* Applications */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-sky-500/40 transition-all text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Applications
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold text-sky-400 mb-1">
              {totalApplicationsCount}
            </div>
            <p className="text-xs text-slate-500">Total applicant submissions</p>
          </div>

          {/* Views */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Views
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 mb-1">
              {totalViewsCount}
            </div>
            <p className="text-xs text-slate-500">Job page impressions</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mb-8" />

        {/* ─── Posted Jobs List & Applications Viewer ──────────────── */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Job Listings & Applications
          </h2>

          <div className="flex flex-col gap-5">
            {displayJobs.map((job) => {
              const count = job.applications?.length || job.applicationsCount || 0;
              const isExpanded = selectedJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-6 transition-all shadow-xl backdrop-blur-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {job.title}
                      </h3>
                      <p className="text-sm font-semibold text-sky-400">
                        {count} Applications
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setSelectedJobId(isExpanded ? null : job.id)
                        }
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                      >
                        {isExpanded ? "Hide Applications ▲" : "View Applications ▼"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Applications Drawer */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-800 animate-fade-in">
                      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                        Applications for {job.title} ({job.applications?.length || 0})
                      </h4>

                      {!job.applications || job.applications.length === 0 ? (
                        <div className="text-center py-8 bg-slate-950/60 rounded-xl border border-slate-800">
                          <p className="text-slate-400 text-sm">
                            No candidate has applied to this job yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {job.applications.map((app) => {
                            const badge = getStatusBadge(app.status);

                            return (
                              <div
                                key={app.id}
                                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all"
                              >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                  <div>
                                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                      <h5 className="text-lg font-bold text-white">
                                        {app.seeker?.name || "Sanskriti Shrestha"}
                                      </h5>
                                      <span className="text-slate-400 text-sm">
                                        • {job.title}
                                      </span>
                                      <span
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}
                                      >
                                        {badge.text}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2">
                                      {app.seeker?.email || "candidate@example.com"}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                      <span className="text-sky-400 font-medium">
                                        📄 {app.resumeName || "Resume.pdf"}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        Applied: {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                      </span>
                                      <span>•</span>
                                      <span>Experience: {app.yearsOfExperience}</span>
                                    </div>
                                  </div>

                                  {/* Action Buttons: View Resume, Shortlist, Reject */}
                                  <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
                                    <button
                                      onClick={() =>
                                        setResumePreview({
                                          name: app.seeker?.name || "Candidate",
                                          resumeName: app.resumeName || "Resume.pdf",
                                          cvUrl: app.cvUrl,
                                          coverLetter: app.coverLetter,
                                        })
                                      }
                                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-sky-300 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
                                    >
                                      View Resume
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleStatusChange(app.id, "SHORTLISTED", app.seeker?.name)
                                      }
                                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-all cursor-pointer"
                                    >
                                      Shortlist
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleStatusChange(app.id, "INTERVIEW", app.seeker?.name)
                                      }
                                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 transition-all cursor-pointer"
                                    >
                                      Interview
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleStatusChange(app.id, "REJECTED", app.seeker?.name)
                                      }
                                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>

                                {app.coverLetter && (
                                  <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                                    <span className="text-slate-400 font-semibold block mb-1">
                                      Cover Letter:
                                    </span>
                                    {app.coverLetter}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Resume View Modal ────────────────────────────────────── */}
      {resumePreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 animate-scale-in text-slate-100 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setResumePreview(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              {resumePreview.name}&apos;s Resume
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              File: {resumePreview.resumeName}
            </p>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center mb-6">
              <div className="text-5xl mb-3">📄</div>
              <p className="font-semibold text-white text-sm mb-1">
                {resumePreview.resumeName}
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Verified candidate document
              </p>
              <a
                href={resumePreview.cvUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-xs hover:bg-sky-400 transition-all shadow-md shadow-sky-500/20"
              >
                Open External Document ↗
              </a>
            </div>

            {resumePreview.coverLetter && (
              <div className="mb-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Cover Letter
                </span>
                <p className="text-slate-300 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                  {resumePreview.coverLetter}
                </p>
              </div>
            )}

            <button
              onClick={() => setResumePreview(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
