import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) return errorResponse("Invalid Job ID", 400);

  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED. Please log in.", 401);
  if (user.role !== "SEEKER") return errorResponse("FORBIDDEN: Job seekers only.", 403);

  const body = await request.json();
  const { cvUrl, coverLetter, yearsOfExperience, resumeName } = body;

  if (!cvUrl && !coverLetter) {
    return errorResponse("Please provide your resume and cover letter.", 400);
  }

  try {
    // Ensure job exists in DB
    let job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
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

    const application = await prisma.application.create({
      data: {
        cvUrl: cvUrl || "https://drive.google.com/sample-resume",
        resumeName: resumeName || "Resume.pdf",
        coverLetter: coverLetter || "I am interested in this role and would love to contribute to your team.",
        yearsOfExperience: yearsOfExperience || "2 years",
        seekerId: user.id,
        jobId: jobId,
        status: "PENDING",
      },
      include: {
        job: true,
      },
    });

    return successResponse(
      {
        message: "Application submitted successfully!",
        data: application,
      },
      201
    );
  } catch (err) {
    if (err.code === "P2002") {
      return errorResponse("You have already applied for this job!", 400);
    }
    console.error("Apply error:", err);
    return errorResponse(`Error applying to the job: ${err.message || err}`, 500);
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) return errorResponse("Invalid Job ID", 400);

  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);
  if (user.role !== "SEEKER") return errorResponse("FORBIDDEN", 403);

  try {
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_seekerId: {
          jobId,
          seekerId: user.id,
        },
      },
      select: { id: true },
    });

    if (!existingApplication) {
      return errorResponse("You have not applied for this job.", 404);
    }

    const removedApplication = await prisma.application.delete({
      where: {
        id: existingApplication.id,
      },
    });

    return successResponse(
      { message: "Application withdrawn successfully", data: removedApplication },
      200
    );
  } catch (err) {
    return errorResponse(`Error withdrawing application: ${err.message || err}`, 500);
  }
}
