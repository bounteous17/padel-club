import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const firstNames = [
  'Carlos', 'Maria', 'Juan', 'Ana', 'Pedro', 'Laura', 'Miguel', 'Sofia',
  'Diego', 'Elena', 'Pablo', 'Isabel', 'Fernando', 'Carmen', 'Alejandro',
  'Lucia', 'Rafael', 'Patricia', 'Antonio', 'Beatriz'
];

const secondNames = [
  'Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez', 'Hernandez',
  'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez',
  'Diaz', 'Reyes', 'Morales', 'Cruz', 'Ortiz', 'Gutierrez', 'Chavez'
];

const timeSlots = [
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

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRating(): number {
  // Generate rating between 0 and 10 with 0.1 increments
  return Math.round(Math.random() * 100) / 10;
}

function randomAge(): number {
  // Generate age between 18 and 65
  return Math.floor(Math.random() * (65 - 18 + 1)) + 18;
}

function randomPreferenceHours(): string[] {
  const count = Math.floor(Math.random() * 4) + 1; // 1-4 time slots
  const shuffled = [...timeSlots].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function main() {
  console.log('Seeding database...');

  // Clear existing players
  await prisma.player.deleteMany();

  // Create 20 sample players
  const players = [];
  for (let i = 0; i < 20; i++) {
    players.push({
      firstName: randomElement(firstNames),
      secondName: randomElement(secondNames),
      rating: randomRating(),
      age: randomAge(),
      preferenceHours: randomPreferenceHours(),
    });
  }

  for (const player of players) {
    await prisma.player.create({ data: player });
  }

  console.log(`Created ${players.length} players`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
