import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Enrich job for consistent display
function enrichJob(job) {
  const text = `${job.title} ${job.description} ${job.location}`.toLowerCase();
  
  const skillsList = [];
  const knownSkills = [
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
  for (const skill of knownSkills) {
    if (text.includes(skill.toLowerCase())) {
      skillsList.push(skill);
    }
  }
  if (skillsList.length === 0) {
    skillsList.push("React", "Next.js", "TypeScript");
  }

  let workplaceType = "On-site";
  if (text.includes("remote")) workplaceType = "Remote";
  else if (text.includes("hybrid")) workplaceType = "Hybrid";

  const salary = job.salary || 50000;
  const minSal = Math.round((salary * 0.75) / 1000) * 1000;
  const maxSal = Math.round((salary * 1.35) / 1000) * 1000;
  const salaryFormatted = `Rs. ${minSal.toLocaleString()} – ${maxSal.toLocaleString()}`;

  return {
    ...job,
    workplaceType: job.workplaceType || workplaceType,
    skills: job.skills || skillsList,
    salaryFormatted: job.salaryFormatted || salaryFormatted,
    salaryMin: job.salaryMin || minSal,
    salaryMax: job.salaryMax || maxSal,
    experienceYears: job.experienceYears || "1-3 years",
  };
}

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) {
    return errorResponse("UNAUTHORIZED. Please log in.", 401);
  }

  try {
    const savedRecords = await prisma.savedJob.findMany({
      where: {
        userId: user.id,
      },
      include: {
        job: {
          include: {
            employer: {
              select: {
                name: true,
                email: true,
              },
            },
            applications: {
              select: {
                seekerId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const savedJobs = savedRecords
      .filter((record) => record.job)
      .map((record) => ({
        savedRecordId: record.id,
        savedAt: record.createdAt,
        ...enrichJob(record.job),
      }));

    return successResponse(savedJobs, 200);
  } catch (err) {
    console.error("Error fetching saved jobs:", err);
    return errorResponse(`Error fetching saved jobs: ${err.message || err}`, 500);
  }
}
