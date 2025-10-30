import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default, { Router } from "express";
import cors from "cors";
import pkg from "@prisma/client";
import { z } from "zod";
const router$2 = Router();
router$2.get("/", (_req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
});
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const router$1 = Router();
router$1.get("/", async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        applications: true
      }
    });
    const formattedJobs = jobs.map((job) => {
      const startedOnDate = new Date(job.createdAt);
      const startedOnText = `started on ${startedOnDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
      return {
        id: job.id,
        slug: job.slug,
        title: job.title,
        status: job.jobStatus,
        jobType: job.jobType,
        salary_range: {
          min: job.salaryMin,
          max: job.salaryMax,
          currency: job.currency,
          display_text: `Rp${job.salaryMin.toLocaleString("id-ID")} - Rp${job.salaryMax.toLocaleString("id-ID")}`
        },
        list_card: {
          badge: job.jobStatus.charAt(0).toUpperCase() + job.jobStatus.slice(1),
          started_on_text: startedOnText,
          cta: "Manage Job"
        },
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        company: job.company,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        candidates: job.candidates
      };
    });
    res.json({ data: formattedJobs });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});
router$1.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`Received request for job ID: ${id}`);
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        applications: true
      }
    });
    if (job) {
      const startedOnDate = new Date(job.createdAt);
      const startedOnText = `started on ${startedOnDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
      const formattedJob = {
        id: job.id,
        slug: job.slug,
        title: job.title,
        status: job.jobStatus,
        jobType: job.jobType,
        salary_range: {
          min: job.salaryMin,
          max: job.salaryMax,
          currency: job.currency,
          display_text: `Rp${job.salaryMin.toLocaleString("id-ID")} - Rp${job.salaryMax.toLocaleString("id-ID")}`
        },
        list_card: {
          badge: job.jobStatus.charAt(0).toUpperCase() + job.jobStatus.slice(1),
          started_on_text: startedOnText,
          cta: "Manage Job"
        },
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        company: job.company,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        applications: job.applications
        // Keep applications as is
      };
      console.log("Found and formatted job:", formattedJob);
      res.json(formattedJob);
    } else {
      console.log(`Job with ID ${id} not found.`);
      res.status(404).json({ error: "Job not found" });
    }
  } catch (error) {
    console.error(`Failed to fetch job with ID ${id}:`, error);
    res.status(500).json({ error: "Failed to fetch job", details: error.message });
  }
});
router$1.post("/", async (req, res) => {
  try {
    const { title, description, requirements, salaryMin, salaryMax, location, jobType, jobStatus, company, slug: incomingSlug } = req.body;
    let baseSlug = incomingSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.job.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    const jobData = {
      title,
      description,
      requirements: requirements || "",
      salaryMin: parseFloat(salaryMin) || 0,
      salaryMax: parseFloat(salaryMax) || 0,
      currency: "IDR",
      location: location || "Jakarta Selatan",
      jobType: jobType || "full-time",
      jobStatus: jobStatus || "draft",
      company: company || "Rakamin",
      slug
    };
    const newJob = await prisma.job.create({
      data: jobData
    });
    res.status(201).json(newJob);
  } catch (error) {
    console.error("Failed to create job:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
});
router$1.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, requirements, salaryMin, salaryMax, location, jobType, jobStatus, company, slug } = req.body;
  try {
    const jobData = {
      title,
      description,
      requirements,
      salaryMin: parseFloat(salaryMin) || 0,
      salaryMax: parseFloat(salaryMax) || 0,
      location,
      jobType,
      jobStatus,
      company,
      slug
    };
    const updatedJob = await prisma.job.update({
      where: { id },
      data: jobData
    });
    res.json(updatedJob);
  } catch (error) {
    console.error("Failed to update job:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
});
router$1.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.job.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job" });
  }
});
const router = Router();
router.get("/", async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        job: true
      }
    });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        job: true
      }
    });
    if (candidate) {
      res.json(candidate);
    } else {
      res.status(404).json({ error: "Candidate not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch candidate" });
  }
});
router.post("/", async (req, res) => {
  try {
    console.log("Received candidate data:", req.body);
    const {
      full_name,
      date_of_birth,
      gender,
      domicile,
      phone_number,
      email,
      linkedin_link,
      photo_profile,
      jobId
      // Assuming jobId is sent from the frontend
    } = req.body;
    const newCandidate = await prisma.candidate.create({
      data: {
        full_name,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
        gender,
        domicile,
        phone_number,
        email,
        linkedin_link,
        photo_profile,
        job: {
          connect: { id: jobId }
        }
      }
    });
    res.status(201).json(newCandidate);
  } catch (error) {
    console.error("Failed to create candidate:", error);
    res.status(500).json({ error: "Failed to create candidate", details: error.message });
  }
});
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: req.body
    });
    res.json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ error: "Failed to update candidate" });
  }
});
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.candidate.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete candidate" });
  }
});
const applicationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dob: z.string().transform((str) => new Date(str)),
  domicile: z.string().min(1, "Domicile is required"),
  gender: z.enum(["Female", "Male"], { message: "Gender must be Female or Male" }),
  linkedin: z.string().url().regex(/linkedin\.com/, "LinkedIn profile must be a valid LinkedIn URL"),
  photoUrl: z.string().optional()
});
const createApplication = async (req, res) => {
  const { jobId } = req.params;
  try {
    const validatedData = applicationSchema.parse(req.body);
    const application = await prisma.application.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        dob: validatedData.dob,
        domicile: validatedData.domicile,
        gender: validatedData.gender,
        linkedin: validatedData.linkedin,
        photoUrl: validatedData.photoUrl,
        job: {
          connect: {
            id: jobId
          }
        }
      }
    });
    res.status(201).json({ id: application.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      return res.status(422).json({ fieldErrors });
    }
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};
const listApplications = async (req, res) => {
  const { jobId } = req.params;
  const { search, page = 1, pageSize = 20, sort = "-createdAt" } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);
  const orderBy = {};
  if (sort === "-createdAt") {
    orderBy.createdAt = "desc";
  } else if (sort === "createdAt") {
    orderBy.createdAt = "asc";
  }
  const where = { jobId };
  if (search) {
    where.OR = [
      { fullName: { contains: String(search), mode: "insensitive" } },
      { email: { contains: String(search), mode: "insensitive" } },
      { phone: { contains: String(search), mode: "insensitive" } }
    ];
  }
  try {
    const [items, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        orderBy,
        skip,
        take
      }),
      prisma.application.count({ where })
    ]);
    res.status(200).json({ items, total });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json({ limit: "50mb" }));
  app2.use(express__default.urlencoded({ extended: true, limit: "50mb" }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.use("/api/demo", router$2);
  app2.use("/api/jobs", router$1);
  app2.use("/api/candidates", router);
  app2.post("/api/jobs/:jobId/applications", createApplication);
  app2.get("/api/jobs/:jobId/applications", listApplications);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
