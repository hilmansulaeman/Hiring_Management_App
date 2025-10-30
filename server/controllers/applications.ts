import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prismaClient';

const applicationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dob: z.string().transform((str) => new Date(str)),
  domicile: z.string().min(1, 'Domicile is required'),
  gender: z.enum(['Female', 'Male'], { message: 'Gender must be Female or Male' }),
  linkedin: z.string().url().regex(/linkedin\.com/, 'LinkedIn profile must be a valid LinkedIn URL'),
  photoUrl: z.string().optional(),
});

export const createApplication = async (req: Request, res: Response) => {
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
            id: jobId,
          },
        },
      },
    });
    res.status(201).json({ id: application.id });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const fieldErrors: { [key: string]: string } = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      return res.status(422).json({ fieldErrors });
    }
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

export const listApplications = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { search, page = 1, pageSize = 20, sort = '-createdAt' } = req.query;

  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  const orderBy: any = {};
  if (sort === '-createdAt') {
    orderBy.createdAt = 'desc';
  } else if (sort === 'createdAt') {
    orderBy.createdAt = 'asc';
  }

  const where: any = { jobId };
  if (search) {
    where.OR = [
      { fullName: { contains: String(search), mode: 'insensitive' } },
      { email: { contains: String(search), mode: 'insensitive' } },
      { phone: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  try {
    const [items, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.application.count({ where }),
    ]);

    res.status(200).json({ items, total });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};
