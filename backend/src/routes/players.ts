import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface PlayerFilters {
  firstName?: string;
  secondName?: string;
  ratingMin?: string;
  ratingMax?: string;
  ageMin?: string;
  ageMax?: string;
  preferenceHours?: string;
}

router.get('/', async (req: Request<{}, {}, {}, PlayerFilters>, res: Response) => {
  try {
    const {
      firstName,
      secondName,
      ratingMin,
      ratingMax,
      ageMin,
      ageMax,
      preferenceHours,
    } = req.query;

    const where: Prisma.PlayerWhereInput = {};

    // Name filters (case-insensitive partial match)
    if (firstName) {
      where.firstName = {
        contains: firstName,
        mode: 'insensitive',
      };
    }

    if (secondName) {
      where.secondName = {
        contains: secondName,
        mode: 'insensitive',
      };
    }

    // Rating range filter
    if (ratingMin || ratingMax) {
      where.rating = {};
      if (ratingMin) {
        where.rating.gte = parseFloat(ratingMin);
      }
      if (ratingMax) {
        where.rating.lte = parseFloat(ratingMax);
      }
    }

    // Age range filter
    if (ageMin || ageMax) {
      where.age = {};
      if (ageMin) {
        where.age.gte = parseInt(ageMin, 10);
      }
      if (ageMax) {
        where.age.lte = parseInt(ageMax, 10);
      }
    }

    // Preference hours filter (match any of the selected time slots)
    if (preferenceHours) {
      const hours = preferenceHours.split(',').map(h => h.trim());
      where.preferenceHours = {
        hasSome: hours,
      };
    }

    const players = await prisma.player.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

export default router;
