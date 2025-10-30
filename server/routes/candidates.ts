import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        job: true,
      },
    });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get a single candidate by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });
    if (candidate) {
      res.json(candidate);
    } else {
      res.status(404).json({ error: 'Candidate not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// Create a new candidate
router.post('/', async (req, res) => {
  try {
    console.log("Received candidate data:", req.body); // Log incoming data

    const {
      full_name,
      date_of_birth,
      gender,
      domicile,
      phone_number,
      email,
      linkedin_link,
      photo_profile,
      jobId, // Assuming jobId is sent from the frontend
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
          connect: { id: jobId },
        },
      },
    });
    res.status(201).json(newCandidate);
  } catch (error: any) { // Explicitly type error as any for full logging
    console.error("Failed to create candidate:", error);
    res.status(500).json({ error: 'Failed to create candidate', details: error.message }); // Include error details
  }
});

// Update a candidate
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: req.body,
    });
    res.json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete a candidate
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.candidate.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export default router;
