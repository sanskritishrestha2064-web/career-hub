"use server";

import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginHandler(token) {
  try {
    const decodedToken = verifyToken(token);

    if (!decodedToken || !decodedToken.id) {
      return { error: "Invalid Token! Please log in again!" };
    }

    const cookieStore = await cookies();

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    // redirect("/dashboard");

    const redirectTo = decodedToken.role !== "SEEKER" ? "/dashboard" : "/jobs";

    return {
      success: true,
      redirectTo,
    };
  } catch (err) {
    console.error("Login Server Error:", err);
    return { error: "Something went wrong during login." };
  }
}

export async function logoutHandler() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  return {
    success: true,
    redirectTo: "/auth/login",
  };
}
