"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const checkRoleAndRedirect = async () => {
      try {
        const res = await fetch("/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (json.success && json.data) {
          if (json.data.role === "EMPLOYER") {
            router.replace("/dashboard/employer");
          } else {
            router.replace("/dashboard/seeker");
          }
        } else {
          router.replace("/dashboard/seeker");
        }
      } catch (err) {
        console.error("Dashboard router error:", err);
        router.replace("/dashboard/seeker");
      } finally {
        setLoading(false);
      }
    };

    checkRoleAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}