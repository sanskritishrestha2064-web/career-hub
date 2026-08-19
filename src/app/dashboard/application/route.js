import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "EMPLOYER") return errorResponse("FORBIDDEN: Employers only", 403);

  try {
    const body = await request.json();
    const { appId, status } = body;

    if (!appId || !status) {
      return errorResponse("Missing appId or status", 400);
    }

    const changeStatus = await prisma.application.update({
      where: {
        id: parseInt(appId),
      },
      data: { status },
      include: {
        seeker: {
          select: {
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    return successResponse(
      {
        message: `Application status updated to ${status}`,
        data: changeStatus,
      },
      200
    );
  } catch (err) {
    console.error("Application PATCH error:", err);
    return errorResponse(`Error updating application status: ${err.message || err}`, 500);
  }
}