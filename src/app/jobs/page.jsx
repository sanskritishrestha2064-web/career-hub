"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const LOCATIONS = [
  "All Locations",
  "Kathmandu",
  "Lalitpur",
  "Pokhara",
  "Bhaktapur",
  "Biratnagar",
  "Chitwan",
  "Remote",
];

const JOB_TYPES = [
  { label: "All Job Types", value: "ALL" },
  { label: "Full-Time", value: "FULL_TIME" },
  { label: "Part-Time", value: "PART_TIME" },
  { label: "Internship", value: "INTERNSHIP" },
  { label: "Contract", value: "CONTRACT" },
];

const EXPERIENCES = [
  "All Experience",
  "Entry Level (0-1 yrs)",
  "Mid Level (1-3 yrs)",
  "Senior Level (3-5 yrs)",
  "Lead / Expert (5+ yrs)",
];

const SALARY_RANGES = [
  { label: "All Salaries", value: "ALL", min: 0, max: Infinity },
  { label: "Under Rs. 30,000", value: "UNDER_30K", min: 0, max: 30000 },
  { label: "Rs. 30,000 – 50,000", value: "30K_50K", min: 30000, max: 50000 },
  { label: "Rs. 50,000 – 80,000", value: "50K_80K", min: 50000, max: 80000 },
  { label: "Rs. 80,000 – 120,000", value: "80K_120K", min: 80000, max: 120000 },
  { label: "Rs. 120,000+", value: "120K_PLUS", min: 120000, max: Infinity },
];

const SKILLS_LIST = [
  "All Skills",
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Tailwind CSS",
  "PostgreSQL",
  "Docker",
  "Figma",
  "GraphQL",
  "React Native",
  "Machine Learning",
  "FastAPI",
];

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedJobType, setSelectedJobType] = useState("ALL");
  const [selectedExperience, setSelectedExperience] = useState("All Experience");
  const [selectedSalary, setSelectedSalary] = useState("ALL");
  const [selectedSkill, setSelectedSkill] = useState("All Skills");
  const [workplaceTypes, setWorkplaceTypes] = useState({
    Remote: false,
    Hybrid: false,
    "On-site": false,
  });

  // Saved Jobs & View Details Modal States
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Apply Form State inside Modal
  const [isApplying, setIsApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({
    cvUrl: "",
    yearsOfExperience: "",
    coverLetter: "",
  });
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyResult, setApplyResult] = useState(null);

  // Load Saved Jobs from API & localStorage on Mount
  useEffect(() => {
    const loadSavedJobs = async () => {
      // 1. Initial load from localStorage
      try {
        const saved = localStorage.getItem("careerhub_saved_jobs");
        if (saved) {
          setSavedJobIds(JSON.parse(saved));
        }
      } catch (e) {}

      // 2. Fetch from DB if user is logged in
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("/api/saved-jobs", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const dbSavedIds = json.data.map((j) => j.id);
            setSavedJobIds(dbSavedIds);
            localStorage.setItem("careerhub_saved_jobs", JSON.stringify(dbSavedIds));
          }
        } catch (err) {
          console.warn("Could not load saved jobs from server", err);
        }
      }
    };

    loadSavedJobs();
  }, []);

  // Fetch Jobs from API
  const fetchJobs = async () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/jobs", { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setJobs(json.data);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Toast Notification Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle Save Job (Persists to PostgreSQL SavedJob + localStorage)
  const handleToggleSave = async (jobId, jobTitle, e) => {
    if (e) e.stopPropagation();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const isSaved = savedJobIds.includes(jobId);

    // Optimistic UI state update
    let updated;
    if (isSaved) {
      updated = savedJobIds.filter((id) => id !== jobId);
      showToast(`♡ Removed "${jobTitle}" from Saved Jobs`);
    } else {
      updated = [...savedJobIds, jobId];
      showToast(`♥ Saved "${jobTitle}"! View in Dashboard └── Saved Jobs`);
    }
    setSavedJobIds(updated);
    try {
      localStorage.setItem("careerhub_saved_jobs", JSON.stringify(updated));
    } catch (err) {}

    // Persist to Server / Neon PostgreSQL if authenticated
    if (token) {
      try {
        await fetch(`/api/jobs/${jobId}/save`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (apiErr) {
        console.error("Failed to sync save status with server:", apiErr);
      }
    }
  };

  // Workplace Checkbox Toggle
  const handleWorkplaceToggle = (type) => {
    setWorkplaceTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedLocation("All Locations");
    setSelectedJobType("ALL");
    setSelectedExperience("All Experience");
    setSelectedSalary("ALL");
    setSelectedSkill("All Skills");
    setWorkplaceTypes({
      Remote: false,
      Hybrid: false,
      "On-site": false,
    });
    setShowSavedOnly(false);
  };

  const isAnyFilterActive =
    searchQuery.trim() !== "" ||
    selectedLocation !== "All Locations" ||
    selectedJobType !== "ALL" ||
    selectedExperience !== "All Experience" ||
    selectedSalary !== "ALL" ||
    selectedSkill !== "All Skills" ||
    workplaceTypes.Remote ||
    workplaceTypes.Hybrid ||
    workplaceTypes["On-site"] ||
    showSavedOnly;

  // Filtered Jobs Computation
  const filteredJobs = useMemo(() => {
    const activeWorkplaces = Object.entries(workplaceTypes)
      .filter(([, active]) => active)
      .map(([type]) => type.toLowerCase());

    const selectedSalaryConfig = SALARY_RANGES.find(
      (s) => s.value === selectedSalary
    );

    return jobs.filter((job) => {
      // Saved Only Filter
      if (showSavedOnly && !savedJobIds.includes(job.id)) {
        return false;
      }

      // Search Query filter (checks title, company, description, location, skills)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = job.title?.toLowerCase().includes(query);
        const compMatch = job.company?.toLowerCase().includes(query);
        const locMatch = job.location?.toLowerCase().includes(query);
        const descMatch = job.description?.toLowerCase().includes(query);
        const skillsMatch = job.skills?.some((sk) =>
          sk.toLowerCase().includes(query)
        );

        if (!titleMatch && !compMatch && !locMatch && !descMatch && !skillsMatch) {
          return false;
        }
      }

      // Location Filter
      if (selectedLocation !== "All Locations") {
        const locLower = job.location?.toLowerCase() || "";
        const targetLower = selectedLocation.toLowerCase();
        if (
          !locLower.includes(targetLower) &&
          !(selectedLocation === "Remote" && job.workplaceType === "Remote")
        ) {
          return false;
        }
      }

      // Job Type Filter
      if (selectedJobType !== "ALL" && job.type !== selectedJobType) {
        return false;
      }

      // Experience Level Filter
      if (selectedExperience !== "All Experience") {
        const jobExp = `${job.experienceLevel || ""} ${job.experienceYears || ""}`.toLowerCase();
        if (
          selectedExperience.includes("Entry") &&
          !jobExp.includes("entry") &&
          !jobExp.includes("0-1") &&
          !jobExp.includes("intern")
        ) {
          return false;
        }
        if (
          selectedExperience.includes("Mid") &&
          !jobExp.includes("mid") &&
          !jobExp.includes("1-3") &&
          !jobExp.includes("2+")
        ) {
          return false;
        }
        if (
          selectedExperience.includes("Senior") &&
          !jobExp.includes("senior") &&
          !jobExp.includes("3-5") &&
          !jobExp.includes("3+")
        ) {
          return false;
        }
        if (
          selectedExperience.includes("Lead") &&
          !jobExp.includes("lead") &&
          !jobExp.includes("5+")
        ) {
          return false;
        }
      }

      // Salary Range Filter
      if (selectedSalaryConfig && selectedSalaryConfig.value !== "ALL") {
        const salaryVal = job.salary || job.salaryMin || 0;
        if (
          salaryVal < selectedSalaryConfig.min ||
          salaryVal > selectedSalaryConfig.max
        ) {
          return false;
        }
      }

      // Skills Filter
      if (selectedSkill !== "All Skills") {
        const skillLower = selectedSkill.toLowerCase();
        const hasSkill =
          job.skills?.some((s) => s.toLowerCase() === skillLower) ||
          job.description?.toLowerCase().includes(skillLower) ||
          job.title?.toLowerCase().includes(skillLower);
        if (!hasSkill) return false;
      }

      // Workplace Type Checkboxes Filter (Remote, Hybrid, On-site)
      if (activeWorkplaces.length > 0) {
        const jobWp = (job.workplaceType || "On-site").toLowerCase();
        if (!activeWorkplaces.includes(jobWp)) {
          return false;
        }
      }

      return true;
    });
  }, [
    jobs,
    searchQuery,
    selectedLocation,
    selectedJobType,
    selectedExperience,
    selectedSalary,
    selectedSkill,
    workplaceTypes,
    showSavedOnly,
    savedJobIds,
  ]);

  // Handle Apply Submission in Modal
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setApplyResult({
        success: false,
        message: "Please log in as a job seeker to apply for this job.",
      });
      return;
    }

    setApplySubmitting(true);
    setApplyResult(null);

    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(applyForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setApplyResult({
          success: false,
          message: data.error || data.message || "Failed to submit application.",
        });
      } else {
        setApplyResult({
          success: true,
          message: "Application submitted successfully! Good luck!",
        });
        setApplyForm({ cvUrl: "", yearsOfExperience: "", coverLetter: "" });
        setTimeout(() => {
          setIsApplying(false);
          setApplyResult(null);
        }, 2500);
      }
    } catch (err) {
      setApplyResult({
        success: false,
        message: `Error applying: ${err.message}`,
      });
    } finally {
      setApplySubmitting(false);
    }
  };

  // Helper for Job Type Badges
  const getTypeBadge = (type) => {
    switch (type) {
      case "FULL_TIME":
        return { text: "Full-time", bg: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
      case "INTERNSHIP":
        return { text: "Internship", bg: "bg-purple-500/15 text-purple-400 border-purple-500/30" };
      case "PART_TIME":
        return { text: "Part-time", bg: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
      case "CONTRACT":
        return { text: "Contract", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
      default:
        return { text: type ? type.replace("_", " ") : "Full-time", bg: "bg-slate-700 text-slate-300 border-slate-600" };
    }
  };

  // Workplace badge helper
  const getWorkplaceBadge = (wp) => {
    const wpType = wp || "On-site";
    switch (wpType) {
      case "Remote":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Hybrid":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-slate-950 text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-sky-500/50 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up backdrop-blur-md">
          <span className="text-sky-400 font-semibold">ℹ</span>
          <span className="text-sm">{toastMessage}</span>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-sky-400 hover:underline ml-2"
          >
            Go to Dashboard →
          </Link>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                Explore Jobs
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Find Your Dream Job
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Discover opportunities matching your skills and career ambitions
            </p>
          </div>

          {/* Quick Saved Jobs Tab Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border cursor-pointer ${
                showSavedOnly
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/10"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
              }`}
            >
              <span>{showSavedOnly ? "♥" : "♡"}</span>
              <span>Saved Jobs ({savedJobIds.length})</span>
            </button>

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            >
              <span>📊 Dashboard</span>
            </Link>
          </div>
        </div>

        {/* ─── Search & Filters Control Panel ───────────────────────── */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 mb-8 shadow-xl shadow-black/20 backdrop-blur-md">
          {/* Top Search Input */}
          <div className="relative mb-5">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-11 pr-10 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-base focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* 5 Dropdown Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
            {/* 1. Location Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full appearance-none bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer pr-8"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-slate-900 text-white">
                      {loc === "All Locations" ? "Location ▼" : loc}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
                  ▼
                </span>
              </div>
            </div>

            {/* 2. Job Type Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Job Type
              </label>
              <div className="relative">
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="w-full appearance-none bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer pr-8"
                >
                  {JOB_TYPES.map((type) => (
                    <option key={type.value} value={type.value} className="bg-slate-900 text-white">
                      {type.value === "ALL" ? "Job Type ▼" : type.label}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
                  ▼
                </span>
              </div>
            </div>

            {/* 3. Experience Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Experience
              </label>
              <div className="relative">
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full appearance-none bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer pr-8"
                >
                  {EXPERIENCES.map((exp) => (
                    <option key={exp} value={exp} className="bg-slate-900 text-white">
                      {exp === "All Experience" ? "Experience ▼" : exp}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
                  ▼
                </span>
              </div>
            </div>

            {/* 4. Salary Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Salary
              </label>
              <div className="relative">
                <select
                  value={selectedSalary}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                  className="w-full appearance-none bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer pr-8"
                >
                  {SALARY_RANGES.map((sal) => (
                    <option key={sal.value} value={sal.value} className="bg-slate-900 text-white">
                      {sal.value === "ALL" ? "Salary ▼" : sal.label}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
                  ▼
                </span>
              </div>
            </div>

            {/* 5. Skills Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Skills
              </label>
              <div className="relative">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full appearance-none bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer pr-8"
                >
                  {SKILLS_LIST.map((skill) => (
                    <option key={skill} value={skill} className="bg-slate-900 text-white">
                      {skill === "All Skills" ? "Skills ▼" : skill}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* Workplace Type Checkboxes & Reset Row */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Workplace:
              </span>

              {["Remote", "Hybrid", "On-site"].map((type) => (
                <label
                  key={type}
                  className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={workplaceTypes[type]}
                    onChange={() => handleWorkplaceToggle(type)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            {/* Clear All Filters Button */}
            {isAnyFilterActive && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>↺</span> Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* ─── Active Filter Tags ───────────────────────────────────── */}
        {isAnyFilterActive && (
          <div className="flex items-center gap-2 flex-wrap mb-6 animate-fade-in">
            <span className="text-xs text-slate-500">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 text-sky-300 px-2.5 py-1 rounded-lg">
                Search: &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-white ml-1 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {selectedLocation !== "All Locations" && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 text-sky-300 px-2.5 py-1 rounded-lg">
                Location: {selectedLocation}
                <button
                  onClick={() => setSelectedLocation("All Locations")}
                  className="hover:text-white ml-1 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {selectedJobType !== "ALL" && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 text-sky-300 px-2.5 py-1 rounded-lg">
                Type: {JOB_TYPES.find((j) => j.value === selectedJobType)?.label}
                <button
                  onClick={() => setSelectedJobType("ALL")}
                  className="hover:text-white ml-1 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {selectedExperience !== "All Experience" && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 text-sky-300 px-2.5 py-1 rounded-lg">
                Exp: {selectedExperience}
                <button
                  onClick={() => setSelectedExperience("All Experience")}
                  className="hover:text-white ml-1 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSalary !== "ALL" && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 text-sky-300 px-2.5 py-1 rounded-lg">
                Salary: {SALARY_RANGES.find((s) => s.value === selectedSalary)?.label}
                <button
                  onClick={() => setSelectedSalary("ALL")}
                  className="hover:text-white ml-1 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSkill !== "All Skills" && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 text-sky-300 px-2.5 py-1 rounded-lg">
                Skill: {selectedSkill}
                <button
                  onClick={() => setSelectedSkill("All Skills")}
                  className="hover:text-white ml-1 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {Object.entries(workplaceTypes)
              .filter(([, v]) => v)
              .map(([k]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 text-emerald-300 px-2.5 py-1 rounded-lg"
                >
                  {k}
                  <button
                    onClick={() => handleWorkplaceToggle(k)}
                    className="hover:text-white ml-1 font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            {showSavedOnly && (
              <span className="inline-flex items-center gap-1 text-xs bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2.5 py-1 rounded-lg">
                ♥ Saved Jobs Only
                <button
                  onClick={() => setShowSavedOnly(false)}
                  className="hover:text-white ml-1 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* ─── Results Header & Counter ─────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Results</h2>
            <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full font-medium">
              {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>
          {searchQuery && (
            <p className="text-sm text-slate-400">
              Matching <span className="text-sky-400 font-medium">&quot;{searchQuery}&quot;</span>
            </p>
          )}
        </div>

        {/* ─── Jobs Listing Grid ───────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-6 bg-slate-800 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-800 rounded w-1/4 mb-4" />
                <div className="h-4 bg-slate-800 rounded w-1/2 mb-6" />
                <div className="flex gap-2">
                  <div className="h-8 bg-slate-800 rounded w-24" />
                  <div className="h-8 bg-slate-800 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No jobs match your criteria</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              We couldn&apos;t find any active listings matching your current search and filters. Try adjusting your filters or resetting them.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-medium text-sm hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job) => {
              const typeBadge = getTypeBadge(job.type);
              const isSaved = savedJobIds.includes(job.id);
              const workplace = job.workplaceType || "On-site";

              return (
                <div
                  key={job.id}
                  className="group bg-slate-900/80 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/5 backdrop-blur-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Job Details Section */}
                    <div className="flex-1">
                      {/* Job Title & Badges */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                          {job.title}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeBadge.bg}`}
                        >
                          {typeBadge.text}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getWorkplaceBadge(
                            workplace
                          )}`}
                        >
                          {workplace}
                        </span>
                      </div>

                      {/* Company & Location line */}
                      <p className="text-slate-300 font-medium text-sm sm:text-base mb-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-white font-semibold">{job.company}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">
                          {job.location} • {workplace}
                        </span>
                      </p>

                      {/* Salary Display */}
                      <div className="mb-3.5 flex items-center gap-3 flex-wrap text-sm">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <span>💰</span>
                          <span>
                            {job.salaryFormatted ||
                              `Rs. ${(job.salary || 50000).toLocaleString()}`}
                          </span>
                        </div>

                        {job.experienceYears && (
                          <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <span className="text-slate-600">•</span>
                            <span>⏱ {job.experienceYears}</span>
                          </div>
                        )}

                        {job.applications && (
                          <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <span className="text-slate-600">•</span>
                            <span>👥 {job.applications.length} applicants</span>
                          </div>
                        )}
                      </div>

                      {/* Skills Tags Pill List */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          {job.skills.map((skill) => (
                            <span
                              key={skill}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSkill(skill);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-sky-300 border border-sky-500/20 hover:border-sky-500/50 hover:bg-sky-500/10 cursor-pointer transition-all"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Short Description */}
                      <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    {/* Right / Action Buttons matching requested design */}
                    <div className="flex sm:flex-row md:flex-col items-stretch gap-2 self-end md:self-start min-w-[140px]">
                      {/* [Apply Now] Button */}
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setIsApplying(true);
                          setApplyResult(null);
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-linear-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-500/20"
                      >
                        <span>Apply Now</span>
                      </button>

                      {/* [View Details] Button */}
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setIsApplying(false);
                          setApplyResult(null);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>View Details</span>
                      </button>

                      {/* ♡ Save / ♥ Saved Button */}
                      <button
                        onClick={(e) => handleToggleSave(job.id, job.title, e)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSaved
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                        }`}
                      >
                        <span className={isSaved ? "text-rose-400" : "text-slate-400"}>
                          {isSaved ? "♥" : "♡"}
                        </span>
                        <span>{isSaved ? "Saved" : "Save"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── View Details Modal ────────────────────────────────────── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-scale-in text-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close button */}
            <button
              onClick={() => {
                setSelectedJob(null);
                setIsApplying(false);
                setApplyResult(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="mb-6 pr-8">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    getTypeBadge(selectedJob.type).bg
                  }`}
                >
                  {getTypeBadge(selectedJob.type).text}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getWorkplaceBadge(
                    selectedJob.workplaceType
                  )}`}
                >
                  {selectedJob.workplaceType || "On-site"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                {selectedJob.title}
              </h2>
              <p className="text-slate-300 font-medium text-base">
                {selectedJob.company} • {selectedJob.location}
              </p>
            </div>

            {/* Quick Metadata Box */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl mb-6 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Salary</span>
                <span className="font-bold text-emerald-400">
                  {selectedJob.salaryFormatted ||
                    `Rs. ${(selectedJob.salary || 50000).toLocaleString()}`}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Experience</span>
                <span className="font-medium text-white">
                  {selectedJob.experienceYears || selectedJob.experienceLevel || "1-3 years"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Applications</span>
                <span className="font-medium text-sky-400">
                  {selectedJob.applications?.length || 0} active
                </span>
              </div>
            </div>

            {/* Skills */}
            {selectedJob.skills && selectedJob.skills.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Required Skills & Technologies
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedJob.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-sky-300 border border-sky-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Description */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                About the Role
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {selectedJob.description}
              </p>
            </div>

            {/* Key Responsibilities */}
            {selectedJob.responsibilities && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Key Responsibilities
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-sm">
                  {selectedJob.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {selectedJob.requirements && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Qualifications & Requirements
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-sm">
                  {selectedJob.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application Section */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              {isApplying ? (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-white">
                        Apply for this job
                      </h4>
                      <p className="text-xs text-slate-400">
                        {selectedJob.title} • {selectedJob.company}
                      </p>
                    </div>
                    <span className="text-xs text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/30 font-semibold">
                      Direct Application
                    </span>
                  </div>

                  {applyResult && (
                    <div
                      className={`p-3.5 rounded-xl text-sm ${
                        applyResult.success
                          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                          : "bg-rose-500/20 border border-rose-500/40 text-rose-300"
                      }`}
                    >
                      {applyResult.message}
                    </div>
                  )}

                  {/* Resume Upload Component */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Resume
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-700/80 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {applyForm.resumeName || "Resume.pdf"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {applyForm.cvUrl || "Attached from profile"}
                        </p>
                      </div>

                      <label className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold cursor-pointer shadow-sm transition-all flex items-center gap-1.5">
                        <span>📁</span>
                        <span>Upload Resume</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setApplyForm({
                                ...applyForm,
                                resumeName: file.name,
                                cvUrl: `https://careerhub.storage/${file.name}`,
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Cover Letter Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Cover Letter:
                    </label>
                    <div className="relative">
                      <textarea
                        required
                        rows={4}
                        value={applyForm.coverLetter}
                        onChange={(e) =>
                          setApplyForm({
                            ...applyForm,
                            coverLetter: e.target.value,
                          })
                        }
                        placeholder="I am interested in this role..."
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={applySubmitting}
                      className="px-6 py-3 rounded-xl bg-linear-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {applySubmitting ? "Submitting..." : "Submit Application"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsApplying(false)}
                      className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm hover:text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsApplying(true)}
                      className="px-6 py-3 rounded-xl bg-linear-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                    >
                      Apply for Position
                    </button>

                    <button
                      onClick={(e) =>
                        handleToggleSave(selectedJob.id, selectedJob.title, e)
                      }
                      className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        savedJobIds.includes(selectedJob.id)
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                      }`}
                    >
                      <span className={savedJobIds.includes(selectedJob.id) ? "text-rose-400" : ""}>
                        {savedJobIds.includes(selectedJob.id) ? "♥" : "♡"}
                      </span>
                      <span>
                        {savedJobIds.includes(selectedJob.id)
                          ? "Saved"
                          : "Save"}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}