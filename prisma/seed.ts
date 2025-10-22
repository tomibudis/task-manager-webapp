import { PrismaClient, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin.com';
  const plain = 'admin123';
  const passwordHash = await bcrypt.hash(plain, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Admin',
      passwordHash,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Set up repo',
        description: 'Initialize the monorepo and CI',
        status: TaskStatus.TODO,
        userId: user.id,
      },
      {
        title: 'Design domain',
        description: 'Define entities and use cases',
        status: TaskStatus.IN_PROGRESS,
        userId: user.id,
      },
      {
        title: 'Ship MVP',
        description: 'Deploy to production',
        status: TaskStatus.DONE,
        userId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded:', { user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
