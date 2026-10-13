
import 'dotenv/config';
import { input, password } from '@inquirer/prompts';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = (
    await input({
      message: 'Admin email:',
      validate: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ||
        'Enter a valid email address',
    })
  )
    .trim()
    .toLowerCase();

  const adminPassword = await password({
    message: 'Admin password (minimum 12 characters):',
    mask: '*',
    validate: (value) =>
      (value.length >= 12 && value.length <= 72) ||
      'Password must be 12–72 characters',
  });

  const passwordHash = await hash(adminPassword, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log('Admin account ready:', admin);
}

main()
  .catch((error) => {
    console.error('Could not create admin account:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
