import prisma from '@/data/prisma/client';

export default async function Home() {
  const [users, tasks] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
  ]);

  const admin = await prisma.user.findUnique({
    where: { email: 'admin@admin.com' },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">DB Status</h1>
      <ul className="mt-4 space-y-2">
        <li>Users: {users}</li>
        <li>Tasks: {tasks}</li>
        <li>Admin present: {admin ? 'yes' : 'no'}</li>
      </ul>
    </div>
  );
}
