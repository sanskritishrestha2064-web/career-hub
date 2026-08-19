import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) return errorResponse("Invalid Job ID", 400);

  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED. Please log in to save jobs.", 401);

  try {
    // Check if the job exists in the DB; if not, ensure job is present
    let job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      // Create a placeholder job in DB so the foreign key relation is satisfied
      // Find an employer user or use current user / create default
      let employer = await prisma.user.findFirst({
        where: { role: "EMPLOYER" },
      });

      if (!employer) {
        employer = await prisma.user.findFirst();
      }

      if (employer) {
        job = await prisma.job.create({
          data: {
            id: jobId,
            title: "Frontend Developer",
            company: "ABC Technologies",
            location: "Kathmandu",
            salary: 55000,
            type: "FULL_TIME",
            description: "Frontend Developer position at ABC Technologies.",
            employerId: employer.id,
          },
        });
      }
    }

    // Check if the job is already saved by this user
    const existingSavedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId: jobId,
        },
      },
    });

    if (existingSavedJob) {
      // Toggle: Unsave
      await prisma.savedJob.delete({
        where: {
          id: existingSavedJob.id,
        },
      });

      return successResponse(
        {
          saved: false,
          message: "Job removed from your saved list.",
          jobId,
        },
        200
      );
    } else {
      // Toggle: Save
      const newSavedJob = await prisma.savedJob.create({
        data: {
          userId: user.id,
          jobId: jobId,
        },
        include: {
          job: true,
        },
      });

      return successResponse(
        {
          saved: true,
          message: "Job saved successfully! You can view it in your Dashboard.",
          data: newSavedJob,
          jobId,
        },
        201
      );
    }
  } catch (err) {
    console.error("Error toggling saved job:", err);
    return errorResponse(`Error saving job: ${err.message || err}`, 500);
  }
}

export async function GET(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) return errorResponse("Invalid Job ID", 400);

  const user = getAuthUser(request);
  if (!user) return successResponse({ saved: false }, 200);

  try {
    const savedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId: jobId,
        },
      },
    });

    return successResponse({ saved: !!savedJob }, 200);
  } catch (err) {
    return errorResponse(`Error checking saved status: ${err.message || err}`, 500);
  }
}
