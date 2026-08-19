"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function NewJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "Kathmandu",
    salary: "",
    type: "FULL_TIME",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in as an employer to post a job.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create job listing");
      }

      router.push("/dashboard/employer");
    } catch (err) {
      console.error("Create job error:", err);
      setError(err.message || "Something went wrong while posting the job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <Link href="/dashboard/employer" className="hover:text-white">
                Dashboard
              </Link>
              <span>└──</span>
              <span className="text-sky-400 font-bold">Post New Job</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Create Job Listing
            </h1>
          </div>
          <Link
            href="/dashboard/employer"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
        >
          {error && (
            <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. ABC Technologies"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Kathmandu"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Monthly Salary (NPR) *
              </label>
              <input
                type="number"
                name="salary"
                required
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. 60000"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Job Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Job Description & Requirements *
            </label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the responsibilities, required skills, and qualifications..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/employer"
              className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:text-white transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3 rounded-xl bg-linear-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Publishing Job..." : "Publish Job Listing →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
