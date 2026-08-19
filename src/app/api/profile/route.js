import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        headline: true,
        about: true,
        experience: true,
        education: true,
        resumeUrl: true,
        resumeName: true,
        location: true,
        phone: true,
        avatarUrl: true,
        skills: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    if (!userProfile) return errorResponse("User not found", 404);

    return successResponse(userProfile, 200);
  } catch (err) {
    console.error("Profile GET error:", err);
    return errorResponse(`Error fetching profile: ${err.message || err}`, 500);
  }
}

export async function PATCH(request) {
  const user = getAuthUser(request);
  if (!user) return errorResponse("UNAUTHORIZED", 401);

  try {
    const body = await request.json();
    const {
      name,
      headline,
      about,
      experience,
      education,
      resumeUrl,
      resumeName,
      location,
      phone,
      avatarUrl,
      skills, // Array of strings e.g. ["React", "Next.js"]
    } = body;

    // Update user profile fields
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : undefined,
        headline: headline !== undefined ? headline : undefined,
        about: about !== undefined ? about : undefined,
        experience: experience !== undefined ? experience : undefined,
        education: education !== undefined ? education : undefined,
        resumeUrl: resumeUrl !== undefined ? resumeUrl : undefined,
        resumeName: resumeName !== undefined ? resumeName : undefined,
        location: location !== undefined ? location : undefined,
        phone: phone !== undefined ? phone : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        headline: true,
        about: true,
        experience: true,
        education: true,
        resumeUrl: true,
        resumeName: true,
        location: true,
        phone: true,
        avatarUrl: true,
      },
    });

    // Update skills if provided
    if (Array.isArray(skills)) {
      // Delete old skills
      await prisma.skill.deleteMany({
        where: { userId: user.id },
      });

      // Create new skills
      if (skills.length > 0) {
        await prisma.skill.createMany({
          data: skills.map((skillName) => ({
            name: skillName.trim(),
            userId: user.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    const fullProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { skills: true },
    });

    return successResponse(fullProfile, 200);
  } catch (err) {
    console.error("Profile PATCH error:", err);
    return errorResponse(`Error updating profile: ${err.message || err}`, 500);
  }
}
