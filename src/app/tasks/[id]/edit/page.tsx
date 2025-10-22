import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import prisma from '@/data/prisma/client';
import EditTaskForm from './form';

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return notFound();
  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/tasks"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold">Edit Task</h1>
      </div>
      <div className="border border-border rounded-lg p-6 bg-card">
        <EditTaskForm task={task} />
      </div>
    </div>
  );
}
