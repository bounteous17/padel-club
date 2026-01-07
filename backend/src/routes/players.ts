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

interface CreatePlayerBody {
  firstName: string;
  secondName: string;
  rating: number;
  age: number;
  preferenceHours: string[];
}

const VALID_TIME_SLOTS = [
  // Regular 1.5-hour intervals
  '07:00 - 08:30',
  '08:30 - 10:00',
  '10:00 - 11:30',
  '11:30 - 13:00',
  '13:00 - 14:30',
  '14:30 - 16:00',
  '16:00 - 17:30',
  '17:30 - 19:00',
  '19:00 - 20:30',
  '20:30 - 22:00',
  // Extra evening slots
  '17:00 - 18:30',
  '18:30 - 20:00',
  '20:00 - 21:30',
];

interface UpdatePlayerBody {
  firstName?: string;
  secondName?: string;
  rating?: number;
  age?: number;
  preferenceHours?: string[];
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

router.post('/', async (req: Request<{}, {}, CreatePlayerBody>, res: Response) => {
  try {
    const { firstName, secondName, rating, age, preferenceHours } = req.body;

    // Validation
    const errors: string[] = [];

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!secondName || typeof secondName !== 'string' || secondName.trim().length === 0) {
      errors.push('Second name is required');
    }

    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      errors.push('Rating must be a number between 0 and 10');
    }

    if (typeof age !== 'number' || age < 1 || age > 120 || !Number.isInteger(age)) {
      errors.push('Age must be a valid integer between 1 and 120');
    }

    if (!Array.isArray(preferenceHours) || preferenceHours.length === 0) {
      errors.push('At least one preference hour is required');
    } else {
      const invalidSlots = preferenceHours.filter(slot => !VALID_TIME_SLOTS.includes(slot));
      if (invalidSlots.length > 0) {
        errors.push(`Invalid time slots: ${invalidSlots.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    const player = await prisma.player.create({
      data: {
        firstName: firstName.trim(),
        secondName: secondName.trim(),
        rating,
        age,
        preferenceHours,
      },
    });

    res.status(201).json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({ error: 'Failed to create player' });
  }
});

router.put('/:id', async (req: Request<{ id: string }, {}, UpdatePlayerBody>, res: Response) => {
  try {
    const { id } = req.params;
    const playerId = parseInt(id, 10);

    if (isNaN(playerId)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }

    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!existingPlayer) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    const { firstName, secondName, rating, age, preferenceHours } = req.body;

    const errors: string[] = [];

    if (firstName !== undefined) {
      if (typeof firstName !== 'string' || firstName.trim().length === 0) {
        errors.push('First name cannot be empty');
      }
    }

    if (secondName !== undefined) {
      if (typeof secondName !== 'string' || secondName.trim().length === 0) {
        errors.push('Second name cannot be empty');
      }
    }

    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 0 || rating > 10) {
        errors.push('Rating must be a number between 0 and 10');
      }
    }

    if (age !== undefined) {
      if (typeof age !== 'number' || age < 1 || age > 120 || !Number.isInteger(age)) {
        errors.push('Age must be a valid integer between 1 and 120');
      }
    }

    if (preferenceHours !== undefined) {
      if (!Array.isArray(preferenceHours) || preferenceHours.length === 0) {
        errors.push('At least one preference hour is required');
      } else {
        const invalidSlots = preferenceHours.filter(slot => !VALID_TIME_SLOTS.includes(slot));
        if (invalidSlots.length > 0) {
          errors.push(`Invalid time slots: ${invalidSlots.join(', ')}`);
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    const updateData: Prisma.PlayerUpdateInput = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (secondName !== undefined) updateData.secondName = secondName.trim();
    if (rating !== undefined) updateData.rating = rating;
    if (age !== undefined) updateData.age = age;
    if (preferenceHours !== undefined) updateData.preferenceHours = preferenceHours;

    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: updateData,
    });

    res.json(updatedPlayer);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const playerId = parseInt(id, 10);

    if (isNaN(playerId)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }

    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!existingPlayer) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    await prisma.player.delete({
      where: { id: playerId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

export default router;
