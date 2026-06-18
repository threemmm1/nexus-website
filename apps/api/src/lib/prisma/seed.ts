import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../logger';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  logger.info('Seeding database...');

  // Seed coin packages
  await prisma.coinPackage.createMany({
    skipDuplicates: true,
    data: [
      { coins: 100, priceUsdCents: 99, sortOrder: 1 },
      { coins: 500, priceUsdCents: 449, sortOrder: 2 },
      { coins: 1000, priceUsdCents: 799, isPopular: true, sortOrder: 3 },
      { coins: 5000, priceUsdCents: 3499, bonusCoins: 500, sortOrder: 4 },
      { coins: 10000, priceUsdCents: 5999, bonusCoins: 2000, sortOrder: 5 },
    ],
  });

  // Seed gifts
  await prisma.gift.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Heart', iconUrl: '/gifts/heart.png', animationUrl: '/gifts/heart.json', coinValue: 1, sortOrder: 1 },
      { name: 'Fire', iconUrl: '/gifts/fire.png', animationUrl: '/gifts/fire.json', coinValue: 5, sortOrder: 2 },
      { name: 'Crown', iconUrl: '/gifts/crown.png', animationUrl: '/gifts/crown.json', coinValue: 20, sortOrder: 3 },
      { name: 'Diamond', iconUrl: '/gifts/diamond.png', animationUrl: '/gifts/diamond.json', coinValue: 100, sortOrder: 4 },
      { name: 'Rocket', iconUrl: '/gifts/rocket.png', animationUrl: '/gifts/rocket.json', coinValue: 500, sortOrder: 5 },
    ],
  });

  // Seed badges
  await prisma.badge.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Early Adopter', description: 'Joined during beta', iconUrl: '/badges/early-adopter.png', isAutomatic: false },
      { name: 'First Post', description: 'Published your first post', iconUrl: '/badges/first-post.png' },
      { name: 'First Stream', description: 'Went live for the first time', iconUrl: '/badges/first-stream.png' },
      { name: 'Level 5', description: 'Reached level 5', iconUrl: '/badges/level-5.png', xpRequired: 500 },
      { name: 'Level 10', description: 'Reached level 10', iconUrl: '/badges/level-10.png', xpRequired: 2000 },
      { name: 'Level 25', description: 'Reached level 25', iconUrl: '/badges/level-25.png', xpRequired: 10000 },
      { name: '7-Day Streak', description: 'Active 7 days in a row', iconUrl: '/badges/streak-7.png', isAutomatic: false },
      { name: '30-Day Streak', description: 'Active 30 days in a row', iconUrl: '/badges/streak-30.png', isAutomatic: false },
    ],
  });

  // Seed daily missions
  await prisma.dailyMission.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Daily Login', description: 'Log in today', xpReward: 5, target: 1, action: 'login' },
      { title: 'Post Something', description: 'Create a post', xpReward: 10, target: 1, action: 'post' },
      { title: 'Like 5 Posts', description: 'Like 5 posts from your feed', xpReward: 5, target: 5, action: 'like' },
      { title: 'Leave 3 Comments', description: 'Comment on 3 posts', xpReward: 15, target: 3, action: 'comment' },
      { title: 'Watch a Stream', description: 'Watch a live stream for 5 minutes', xpReward: 10, target: 1, action: 'watch_stream' },
    ],
  });

  // Seed admin user (dev only)
  if (process.env['NODE_ENV'] === 'development') {
    const passwordHash = await bcrypt.hash('Admin123!', 12);
    await prisma.user.upsert({
      where: { email: 'admin@vesioh.com' },
      update: {},
      create: {
        email: 'admin@vesioh.com',
        username: 'admin',
        displayName: 'Vesioh Admin',
        passwordHash,
        role: 'admin',
        status: 'active',
        isEmailVerified: true,
        wallet: { create: {} },
        notifications: { create: {} },
      },
    });
    logger.info('Dev admin created: admin@vesioh.com / Admin123!');
  }

  logger.info('Seed complete');
}

main()
  .catch((err: unknown) => logger.error('Seed failed', { err }))
  .finally(() => void prisma.$disconnect());
