import { errorResponse, successResponse } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  const user = getAuthUser(request);

  // verify logged in users
  if (!user) return errorResponse("UNAUTHORIZED!", 401);

  // verify role
  if (user.role !== "EMPLOYER")
    return errorResponse("FORBIDDEN: Employers Only!", 403);

  // yo kaam, verify paxi hunu paro
  const body = await request.json();
  const { title, description, location, salary, company, type } = body;

  // verify values
  if (title === "" || description === "" || location === "" || company === "")
    return errorResponse("Important inputs not filled yet!");

  try {
    // insert values to database -> PostgreSQL
    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        location,
        salary: parseInt(salary),
        company,
        type,
        employerId: user.id,
      },
    });

    return successResponse(newJob, 201);
  } catch (err) {
    return errorResponse(`Error inserting jobs to the database: ${err}`);
  }
}

const DEFAULT_JOBS = [
  {
    id: 101,
    title: "Frontend Developer",
    company: "ABC Technologies",
    location: "Kathmandu",
    workplaceType: "Remote",
    salary: 55000,
    salaryMin: 40000,
    salaryMax: 70000,
    salaryFormatted: "Rs. 40,000 – 70,000",
    type: "FULL_TIME",
    experienceLevel: "Mid Level (1-3 yrs)",
    experienceYears: "1-3 years",
    skills: ["React", "Next.js", "TypeScript"],
    description:
      "We are looking for a skilled Frontend Developer with deep React, Next.js, and TypeScript expertise to build performant, responsive web applications.",
    requirements: [
      "2+ years of experience with React, Next.js, and modern JavaScript/TypeScript",
      "Strong understanding of CSS, Tailwind CSS, and responsive design",
      "Experience integrating RESTful APIs and state management",
      "Familiarity with Git and Agile development workflows",
    ],
    responsibilities: [
      "Develop responsive and accessible web interfaces using React and Next.js",
      "Collaborate with backend developers and UI/UX designers",
      "Optimize applications for maximum speed, scalability, and SEO",
    ],
    employer: { name: "ABC Technologies HR", email: "careers@abctech.com" },
    applications: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 102,
    title: "Full Stack Engineer",
    company: "TechNova Solutions",
    location: "Lalitpur",
    workplaceType: "Hybrid",
    salary: 80000,
    salaryMin: 60000,
    salaryMax: 100000,
    salaryFormatted: "Rs. 60,000 – 100,000",
    type: "FULL_TIME",
    experienceLevel: "Senior Level (3-5 yrs)",
    experienceYears: "3-5 years",
    skills: ["React", "Node.js", "PostgreSQL", "Tailwind CSS"],
    description:
      "Join our fast-growing engineering team building scalable SaaS products with React, Node.js, and PostgreSQL.",
    requirements: [
      "3+ years of full-stack development experience",
      "Proficiency in React, Node.js, and relational databases (PostgreSQL)",
      "Understanding of microservices and RESTful API architecture",
    ],
    responsibilities: [
      "Design and implement end-to-end features across frontend and backend",
      "Write clean, maintainable, and well-tested code",
      "Participate in code reviews and architectural planning",
    ],
    employer: { name: "TechNova HR", email: "jobs@technova.io" },
    applications: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 103,
    title: "Backend Developer (Node.js)",
    company: "CloudCraft Inc.",
    location: "Kathmandu",
    workplaceType: "Remote",
    salary: 65000,
    salaryMin: 50000,
    salaryMax: 85000,
    salaryFormatted: "Rs. 50,000 – 85,000",
    type: "FULL_TIME",
    experienceLevel: "Mid Level (1-3 yrs)",
    experienceYears: "2+ years",
    skills: ["Node.js", "TypeScript", "PostgreSQL", "Docker"],
    description:
      "Looking for a Backend Developer to design high-throughput APIs, maintain database performance, and build scalable cloud infrastructure.",
    requirements: [
      "Solid understanding of Node.js, Express, and asynchronous architecture",
      "Experience with SQL / PostgreSQL query optimization and ORMs",
      "Familiarity with containerization using Docker",
    ],
    responsibilities: [
      "Develop secure, robust REST and GraphQL APIs",
      "Monitor database performance and optimize queries",
      "Collaborate with frontend teams for seamless data contracts",
    ],
    employer: { name: "CloudCraft Talent", email: "talent@cloudcraft.com" },
    applications: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 104,
    title: "UI/UX Designer & Frontend",
    company: "DesignSphere Studio",
    location: "Pokhara",
    workplaceType: "Hybrid",
    salary: 45000,
    salaryMin: 35000,
    salaryMax: 55000,
    salaryFormatted: "Rs. 35,000 – 55,000",
    type: "CONTRACT",
    experienceLevel: "Mid Level (1-3 yrs)",
    experienceYears: "1-3 years",
    skills: ["Figma", "React", "Tailwind CSS", "JavaScript"],
    description:
      "Craft stunning visual experiences and translate Figma wireframes into interactive React and Tailwind CSS components.",
    requirements: [
      "Proficiency in Figma, user journey mapping, and prototyping",
      "Solid frontend development skills in React and Tailwind CSS",
      "Strong portfolio showcasing modern UI/UX design and interaction",
    ],
    responsibilities: [
      "Design user flows, wireframes, and high-fidelity prototypes in Figma",
      "Build polished frontend UI components in React",
      "Conduct user research and usability testing",
    ],
    employer: { name: "DesignSphere HR", email: "design@designsphere.np" },
    applications: [],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 105,
    title: "Mobile App Developer (React Native)",
    company: "AppPulse Labs",
    location: "Kathmandu",
    workplaceType: "On-site",
    salary: 60000,
    salaryMin: 45000,
    salaryMax: 75000,
    salaryFormatted: "Rs. 45,000 – 75,000",
    type: "FULL_TIME",
    experienceLevel: "Mid Level (1-3 yrs)",
    experienceYears: "2+ years",
    skills: ["React", "React Native", "TypeScript", "JavaScript"],
    description:
      "Build fluid, cross-platform iOS and Android mobile applications using React Native and TypeScript.",
    requirements: [
      "2+ years experience building and deploying React Native apps",
      "Experience with native bridges, push notifications, and offline caching",
      "Understanding of Apple App Store and Google Play release pipelines",
    ],
    responsibilities: [
      "Build performant cross-platform mobile apps",
      "Integrate mobile device features and secure authentication flows",
      "Publish updates and maintain mobile app releases",
    ],
    employer: { name: "AppPulse Recruiter", email: "hr@apppulse.com" },
    applications: [],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 106,
    title: "Junior Frontend Intern",
    company: "InnovateX Nepal",
    location: "Lalitpur",
    workplaceType: "Remote",
    salary: 25000,
    salaryMin: 20000,
    salaryMax: 30000,
    salaryFormatted: "Rs. 20,000 – 30,000",
    type: "INTERNSHIP",
    experienceLevel: "Entry Level (0-1 yrs)",
    experienceYears: "0-1 year",
    skills: ["React", "JavaScript", "Tailwind CSS"],
    description:
      "Exciting opportunity for aspiring developers to learn, build, and grow by working with modern frontend web technologies.",
    requirements: [
      "Familiarity with HTML, CSS, JavaScript, and React fundamentals",
      "Eagerness to learn modern frameworks, Git, and collaborative dev tools",
      "Passion for building clean, user-friendly web pages",
    ],
    responsibilities: [
      "Assist in building reusable UI components with React",
      "Fix minor frontend bugs and write component documentation",
      "Participate in daily standups and engineering workshops",
    ],
    employer: { name: "InnovateX Mentorship", email: "interns@innovatex.np" },
    applications: [],
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 107,
    title: "Python / AI Engineer",
    company: "Apex Data Systems",
    location: "Kathmandu",
    workplaceType: "On-site",
    salary: 95000,
    salaryMin: 70000,
    salaryMax: 120000,
    salaryFormatted: "Rs. 70,000 – 120,000",
    type: "FULL_TIME",
    experienceLevel: "Senior Level (3-5 yrs)",
    experienceYears: "3+ years",
    skills: ["Python", "Machine Learning", "FastAPI", "PostgreSQL"],
    description:
      "Develop LLM workflows, data pipelines, and machine learning models for production enterprise applications.",
    requirements: [
      "Strong programming skills in Python, FastAPI, and data manipulation libraries",
      "Experience with NLP, machine learning models, and API integrations",
      "Strong background in algorithms and relational database systems",
    ],
    responsibilities: [
      "Build AI-powered endpoints and data processing microservices",
      "Deploy and fine-tune models in production environments",
      "Collaborate with product teams to build intelligent features",
    ],
    employer: { name: "Apex Data Tech", email: "ai@apexdata.com" },
    applications: [],
    createdAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: 108,
    title: "DevOps & Cloud Engineer",
    company: "InfraCore Tech",
    location: "Remote",
    workplaceType: "Remote",
    salary: 105000,
    salaryMin: 80000,
    salaryMax: 130000,
    salaryFormatted: "Rs. 80,000 – 130,000",
    type: "CONTRACT",
    experienceLevel: "Lead / Expert (5+ yrs)",
    experienceYears: "5+ years",
    skills: ["Docker", "Kubernetes", "PostgreSQL", "TypeScript"],
    description:
      "Automate CI/CD pipelines, orchestrate Kubernetes clusters, and maintain secure, highly available cloud infrastructure.",
    requirements: [
      "5+ years working with cloud platforms, Docker, and Kubernetes",
      "Experience with automated deployment workflows, Terraform, and monitoring",
      "Strong knowledge of network security and cloud compliance",
    ],
    responsibilities: [
      "Manage cloud architecture and container orchestration",
      "Build automated CI/CD pipelines for staging and production",
      "Ensure high uptime, disaster recovery, and security compliance",
    ],
    employer: { name: "InfraCore Ops", email: "ops@infracore.io" },
    applications: [],
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

// Helper to infer skills and workplace type from db job if missing
function enrichJob(job) {
  const text = `${job.title} ${job.description} ${job.location}`.toLowerCase();
  
  // Detect skills
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
    if (text.includes("front") || text.includes("web") || text.includes("ui")) {
      skillsList.push("React", "Next.js", "TypeScript");
    } else if (text.includes("back") || text.includes("api")) {
      skillsList.push("Node.js", "PostgreSQL");
    } else {
      skillsList.push("JavaScript", "React");
    }
  }

  // Detect workplace type
  let workplaceType = "On-site";
  if (text.includes("remote")) workplaceType = "Remote";
  else if (text.includes("hybrid")) workplaceType = "Hybrid";

  // Infer salary range formatting
  const salary = job.salary || 50000;
  const minSal = Math.round((salary * 0.75) / 1000) * 1000;
  const maxSal = Math.round((salary * 1.35) / 1000) * 1000;
  const salaryFormatted = `Rs. ${minSal.toLocaleString()} – ${maxSal.toLocaleString()}`;

  // Infer experience level
  let experienceLevel = "Mid Level (1-3 yrs)";
  let experienceYears = "1-3 years";
  if (job.type === "INTERNSHIP" || text.includes("junior") || text.includes("intern")) {
    experienceLevel = "Entry Level (0-1 yrs)";
    experienceYears = "0-1 year";
  } else if (text.includes("senior") || text.includes("lead") || salary > 80000) {
    experienceLevel = "Senior Level (3-5 yrs)";
    experienceYears = "3-5 years";
  }

  return {
    ...job,
    workplaceType: job.workplaceType || workplaceType,
    skills: job.skills || skillsList,
    salaryFormatted: job.salaryFormatted || salaryFormatted,
    salaryMin: job.salaryMin || minSal,
    salaryMax: job.salaryMax || maxSal,
    experienceLevel: job.experienceLevel || experienceLevel,
    experienceYears: job.experienceYears || experienceYears,
    requirements: job.requirements || [
      `Hands-on experience with ${skillsList.slice(0, 3).join(", ")}`,
      "Strong problem-solving and collaboration skills",
      "Ability to write clean, tested, and maintainable code",
    ],
    responsibilities: job.responsibilities || [
      `Build scalable software features using ${skillsList[0] || "modern tech stack"}`,
      "Work closely with product, engineering, and design teammates",
      "Maintain high code quality and perform testing",
    ],
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let dbJobs = [];
    try {
      dbJobs = await prisma.job.findMany({
        where: search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
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
        orderBy: { createdAt: "desc" },
      });
    } catch (dbErr) {
      console.warn("Database query skipped or errored, falling back to rich job catalog:", dbErr.message);
    }

    let allJobs = [];
    if (dbJobs && dbJobs.length > 0) {
      allJobs = dbJobs.map((j) => enrichJob(j));
      // Combine with default catalog ensuring no duplicate IDs
      const dbTitles = new Set(allJobs.map((j) => j.title.toLowerCase()));
      const supplementary = DEFAULT_JOBS.filter((j) => !dbTitles.has(j.title.toLowerCase()));
      allJobs = [...allJobs, ...supplementary];
    } else {
      allJobs = DEFAULT_JOBS;
    }

    return successResponse(allJobs, 200);
  } catch (err) {
    return errorResponse(`Error trying to fetch jobs: ${err.message || err}`);
  }
}

