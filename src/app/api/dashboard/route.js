import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Helper to enrich job presentation
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

  return {
    ...job,
    workplaceType: job.workplaceType || workplaceType,
    skills: job.skills || skillsList,
    salaryFormatted: job.salaryFormatted || `Rs. ${minSal.toLocaleString()} – ${maxSal.toLocaleString()}`,
    salaryMin: job.salaryMin || minSal,
    salaryMax: job.salaryMax || maxSal,
    experienceYears: job.experienceYears || "1-3 years",
  };
}

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  try {
    if (user.role === "EMPLOYER") {
      // Employer dashboard data
      const jobs = await prisma.job.findMany({
        where: {
          employerId: user.id,
        },
        include: {
          applications: {
            include: {
              seeker: {
                select: {
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return successResponse(
        {
          role: "EMPLOYER",
          message: "Employer dashboard data retrieved successfully!",
          data: jobs,
        },
        200
      );
    } else {
      // Seeker dashboard data (saved jobs + applications)
      const [savedJobRecords, applications] = await Promise.all([
        prisma.savedJob.findMany({
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
        }),
        prisma.application.findMany({
          where: {
            seekerId: user.id,
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
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);

      const savedJobs = savedJobRecords
        .filter((record) => record.job)
        .map((record) => ({
          savedRecordId: record.id,
          savedAt: record.createdAt,
          ...enrichJob(record.job),
        }));

      return successResponse(
        {
          role: "SEEKER",
          message: "Seeker dashboard data retrieved successfully!",
          savedJobs,
          applications,
        },
        200
      );
    }
  } catch (err) {
    console.error("Dashboard error:", err);
    return errorResponse(`Error retrieving dashboard data: ${err.message || err}`, 500);
  }
}
