import { Router } from 'express';
import prisma from '../prismaClient';
import { Prisma } from '@prisma/client'; // Import Prisma namespace

const router = Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        applications: true,
      },
    });

    const formattedJobs = (jobs as any[]).map(job => { // Cast to any[] to bypass type errors
      const startedOnDate = new Date(job.createdAt);
      const startedOnText = `started on ${startedOnDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

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
          display_text: `Rp${job.salaryMin.toLocaleString('id-ID')} - Rp${job.salaryMax.toLocaleString('id-ID')}`
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
        candidates: job.candidates,
      };
    });

    res.json({ data: formattedJobs }); // Wrap in 'data' array as per user's request
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get a single job by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Received request for job ID: ${id}`); // Log received ID
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        applications: true,
      },
    });
    if (job) {
      const startedOnDate = new Date(job.createdAt);
      const startedOnText = `started on ${startedOnDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

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
          display_text: `Rp${job.salaryMin.toLocaleString('id-ID')} - Rp${job.salaryMax.toLocaleString('id-ID')}`
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
        applications: job.applications, // Keep applications as is
      };
      console.log("Found and formatted job:", formattedJob); // Log found job
      res.json(formattedJob);
    } else {
      console.log(`Job with ID ${id} not found.`); // Log job not found
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error: any) { // Explicitly type error as any for full logging
    console.error(`Failed to fetch job with ID ${id}:`, error); // Log detailed error
    res.status(500).json({ error: 'Failed to fetch job', details: error.message });
  }
});

// Create a new job
router.post('/', async (req, res) => {
  try {
    const { title, description, requirements, salaryMin, salaryMax, location, jobType, jobStatus, company, slug: incomingSlug } = req.body;

    let baseSlug = incomingSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.job.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const jobData: Prisma.JobCreateInput = {
      title,
      description,
      requirements: requirements || "",
      salaryMin: parseFloat(salaryMin) || 0.0,
      salaryMax: parseFloat(salaryMax) || 0.0,
      currency: "IDR",
      location: location || "Jakarta Selatan",
      jobType: jobType || "full-time",
      jobStatus: jobStatus || "draft",
      company: company || "Hiring_management_app",
      slug,
    };

    const newJob = await prisma.job.create({
      data: jobData,
    });
    res.status(201).json(newJob);
  } catch (error) {
    console.error("Failed to create job:", error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update a job
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, requirements, salaryMin, salaryMax, location, jobType, jobStatus, company, slug } = req.body;

  try {
    const jobData: Prisma.JobUpdateInput = {
      title,
      description,
      requirements,
      salaryMin: parseFloat(salaryMin) || 0.0,
      salaryMax: parseFloat(salaryMax) || 0.0,
      location,
      jobType,
      jobStatus,
      company,
      slug,
    };

    const updatedJob = await prisma.job.update({
      where: { id },
      data: jobData,
    });
    res.json(updatedJob);
  } catch (error) {
    console.error("Failed to update job:", error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete a job
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.job.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;
