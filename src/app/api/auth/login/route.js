import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const { email, password } = await request.json();

  try {
    if (!email || !password)
      return errorResponse("Email and Password are required");

    if (!email) return errorResponse("Email is required!");

    if (!password) return errorResponse("Password is required!");

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return errorResponse("Email or Password incorrect!");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse("Email or Password incorrect!");

    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return successResponse({
      token,
      userInfo: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error: ", err);
    return errorResponse(
      `Error during the login process: ${err.message || err}`,
    );
  }
}
