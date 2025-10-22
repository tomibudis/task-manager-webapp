import { Suspense } from 'react';
import Link from 'next/link';

import { listMyTasksAction } from '@/app/actions/taskActions';
import TaskStatusFilter from './Filter';
import { LogoutButton } from '@/components/LogoutButton';

function getStatusColor(status: string) {
  switch (status) {
    case 'TODO':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DONE':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

async function TasksList({
  status,
}: {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
}) {
  const { items } = await listMyTasksAction(undefined, status);
  return (
    <div className="grid gap-4">
      {items.map((t) => (
        <div
          key={t.id}
          className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors bg-card"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(t.status)}`}
                >
                  {t.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-card-foreground">
                {t.title}
              </h3>
              {t.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {t.description}
                </p>
              ) : null}
            </div>
            <Link
              className="text-sm text-primary hover:text-primary/80 font-medium whitespace-nowrap"
              href={`/tasks/${t.id}/edit`}
            >
              Edit →
            </Link>
          </div>
        </div>
      ))}
      {items.length === 0 ? (
        <div className="border border-border rounded-lg p-8 text-center bg-card">
          <p className="text-muted-foreground">No tasks found</p>
        </div>
      ) : null}
    </div>
  );
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params?.status as 'TODO' | 'IN_PROGRESS' | 'DONE' | undefined;
  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/tasks/new"
            className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
          >
            + New Task
          </Link>
          <LogoutButton />
        </div>
      </div>
      {/* client filter */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <TaskStatusFilter initialStatus={status} />
      </div>
      <Suspense
        key={status}
        fallback={
          <div className="border border-border rounded-lg p-8 text-center bg-card">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <TasksList status={status} />
      </Suspense>
    </div>
  );
}
