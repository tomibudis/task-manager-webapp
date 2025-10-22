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
      Project: {
        create: {
          id: 'seed-project',
          name: 'Getting Started',
        },
      },
    },
    include: { Project: true },
  });

  const projectId = user.Project[0]?.id ?? 'seed-project';

  await prisma.task.createMany({
    data: [
      {
        title: 'Set up repo',
        description: 'Initialize the monorepo and CI',
        status: TaskStatus.TODO,
        projectId,
        userId: user.id,
      },
      {
        title: 'Design domain',
        description: 'Define entities and use cases',
        status: TaskStatus.IN_PROGRESS,
        projectId,
        userId: user.id,
      },
      {
        title: 'Ship MVP',
        description: 'Deploy to production',
        status: TaskStatus.DONE,
        projectId,
        userId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seeded:', { user: user.email, projectId });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
