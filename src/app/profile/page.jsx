"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Sanskriti Shrestha",
    email: "sanskriti@example.com",
    headline: "Frontend Developer",
    about: "Passionate developer focused on building modern, responsive, and performant web applications using React, Next.js, and TypeScript.",
    experience: "Frontend Developer\nABC Company\n2025 – Present",
    education: "BSc Computer Science",
    location: "Kathmandu, Nepal",
    resumeName: "Resume.pdf",
    resumeUrl: "https://drive.google.com/sample-resume",
    skills: ["React", "Next.js", "Node.js", "PostgreSQL", "Prisma"],
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchProfile = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data;
        const skillsArray = Array.isArray(p.skills)
          ? p.skills.map((s) => (typeof s === "string" ? s : s.name))
          : ["React", "Next.js", "Node.js", "PostgreSQL", "Prisma"];

        const updatedProfile = {
          name: p.name || "Sanskriti Shrestha",
          email: p.email || "sanskriti@example.com",
          headline: p.headline || "Frontend Developer",
          about:
            p.about ||
            "Passionate developer focused on building modern, responsive, and performant web applications.",
          experience:
            p.experience || "Frontend Developer\nABC Company\n2025 – Present",
          education: p.education || "BSc Computer Science",
          location: p.location || "Kathmandu, Nepal",
          resumeName: p.resumeName || "Resume.pdf",
          resumeUrl: p.resumeUrl || "https://drive.google.com/sample-resume",
          skills: skillsArray.length > 0 ? skillsArray : ["React", "Next.js", "Node.js", "PostgreSQL", "Prisma"],
        };

        setProfile(updatedProfile);
        setEditForm(updatedProfile);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Compute profile completion and dynamic tip
  const getCompletionData = (data) => {
    let score = 0;
    const missing = [];

    if (data.name?.trim()) score += 15;
    else missing.push("Add full name");

    if (data.headline?.trim()) score += 15;
    else missing.push("Add headline");

    if (data.about?.trim()) score += 15;
    else missing.push("Add about summary");

    if (data.skills?.length > 0) score += 20;
    else missing.push("Add skills");

    if (data.experience?.trim()) score += 15;
    else missing.push("Add work experience");

    if (data.education?.trim()) score += 10;
    else missing.push("Add education");

    if (data.resumeUrl?.trim() || data.resumeName?.trim()) score += 10;
    else missing.push("Add resume");

    const percentage = Math.min(100, Math.max(0, score));
    const nextAction =
      percentage === 100
        ? "Your profile is 100% complete! Ready to apply."
        : missing.length > 0
        ? `${missing[0]} to reach 100%`
        : "Add resume to reach 100%";

    return { percentage, nextAction };
  };

  const { percentage: completionPercentage, nextAction: completionTip } =
    getCompletionData(profile);

  // Add / Remove Skill in edit modal
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!editForm.skills.includes(newSkillInput.trim())) {
      setEditForm((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkillInput.trim()],
      }));
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setSaving(true);

    try {
      if (token) {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update profile");
      }

      setProfile(editForm);
      setIsEditing(false);
      showToast("Profile updated successfully! 🎉");
    } catch (err) {
      console.error("Save profile error:", err);
      showToast("Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading professional profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-slate-950 text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-sky-500/50 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up backdrop-blur-md">
          <span className="text-sky-400 font-semibold">ℹ</span>
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/dashboard/seeker" className="hover:text-white">
              Dashboard
            </Link>
            <span>└──</span>
            <span className="text-sky-400 font-bold">Profile</span>
          </div>

          <Link
            href="/dashboard/seeker"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* ─── Profile Completion Indicator Widget ──────────────────── */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 mb-8 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-white">
                Profile Completion
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                {completionPercentage}%
              </span>
            </div>

            <span className="text-xs text-sky-400 font-medium">
              {completionTip}
            </span>
          </div>

          {/* ASCII / Graphic Bar */}
          <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-800 p-0.5 mb-3">
            <div
              className="bg-linear-to-r from-sky-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <p className="text-xs text-slate-400">
            A complete profile helps you get shortlisted 3x faster by top tech employers.
          </p>
        </div>

        {/* ─── Main Profile Card ────────────────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-md">
          {/* Header & Edit Button */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-sky-500 to-blue-600 flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-lg shadow-sky-500/20">
                {profile.name?.charAt(0) || "S"}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-0.5">
                  {profile.name}
                </h1>
                <p className="text-sky-400 font-semibold text-base sm:text-lg mb-1">
                  {profile.headline}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span>📍 {profile.location}</span>
                  <span>•</span>
                  <span>✉ {profile.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setEditForm(profile);
                setIsEditing(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer self-start sm:self-auto flex items-center gap-2"
            >
              <span>✏</span> Edit Profile
            </button>
          </div>

          {/* ─── About Section ──────────────────────────────────────── */}
          <div className="py-6 border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              About
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {profile.about}
            </p>
          </div>

          {/* ─── Skills Section ─────────────────────────────────────── */}
          <div className="py-6 border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Skills
            </h2>
            <div className="flex items-center gap-2.5 flex-wrap">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 text-sky-300 border border-sky-500/20 shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* ─── Experience Section ─────────────────────────────────── */}
          <div className="py-6 border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Experience
            </h2>
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
              <div className="text-sm text-slate-200 whitespace-pre-line font-medium leading-relaxed">
                {profile.experience}
              </div>
            </div>
          </div>

          {/* ─── Education Section ──────────────────────────────────── */}
          <div className="py-6 border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Education
            </h2>
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
              <p className="text-sm font-medium text-slate-200">
                {profile.education}
              </p>
            </div>
          </div>

          {/* ─── Resume Attachment ──────────────────────────────────── */}
          <div className="pt-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Attached Resume
            </h2>
            <div className="flex items-center justify-between p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-sm">
                  PDF
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {profile.resumeName || "Resume.pdf"}
                  </p>
                  <p className="text-xs text-slate-500">Verified document</p>
                </div>
              </div>

              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 text-white hover:bg-sky-400 transition-all shadow-sm"
              >
                View Resume ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Edit Profile Modal ─────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-scale-in text-slate-100 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-2xl font-extrabold text-white mb-1">
              Edit Professional Profile
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Update your skills, experience, and details to stand out to hiring managers.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.headline}
                    onChange={(e) =>
                      setEditForm({ ...editForm, headline: e.target.value })
                    }
                    placeholder="e.g. Frontend Developer"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  About Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editForm.about}
                  onChange={(e) =>
                    setEditForm({ ...editForm, about: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500"
                />
              </div>

              {/* Skills Tag Editor */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Skills & Technologies
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type skill (e.g. Docker) and click Add"
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-sky-500 text-white rounded-xl text-xs font-semibold hover:bg-sky-400 cursor-pointer"
                  >
                    + Add Skill
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {editForm.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-sky-300 border border-sky-500/20 flex items-center gap-1.5"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-white font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Experience
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.experience}
                    onChange={(e) =>
                      setEditForm({ ...editForm, experience: e.target.value })
                    }
                    placeholder="e.g. Frontend Developer at ABC Company (2025 – Present)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Education
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.education}
                    onChange={(e) =>
                      setEditForm({ ...editForm, education: e.target.value })
                    }
                    placeholder="e.g. BSc Computer Science"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Resume File Name
                  </label>
                  <input
                    type="text"
                    value={editForm.resumeName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, resumeName: e.target.value })
                    }
                    placeholder="Resume.pdf"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Resume URL Link
                  </label>
                  <input
                    type="url"
                    value={editForm.resumeUrl}
                    onChange={(e) =>
                      setEditForm({ ...editForm, resumeUrl: e.target.value })
                    }
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-linear-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
