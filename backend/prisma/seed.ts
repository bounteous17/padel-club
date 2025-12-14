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
  '06:00 - 08:00',
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 22:00',
  '22:00 - 00:00'
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRating(): number {
  // Generate rating between 0 and 10 with 0.5 increments
  return Math.round(Math.random() * 20) / 2;
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
