'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth/config';
import { PrismaTaskRepository } from '@/repositories/prisma/task.repository';
import { PrismaUserRepository } from '@/repositories/prisma/user.repository';
import {
  CreateTaskService,
  UpdateTaskService,
  DeleteTaskService,
  ListTasksForUserService,
  UpdateTaskStatusService,
} from '@/usecases/task';
import { Pagination, Task, TaskStatus } from '@/domain/types';

const tasksRepo = new PrismaTaskRepository();
const usersRepo = new PrismaUserRepository();

export async function createTaskAction(input: {
  title: string;
  description?: string;
  status?: TaskStatus;
}): Promise<Task> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const create = new CreateTaskService(tasksRepo, usersRepo);
  const task = await create.execute({
    title: input.title,
    description: input.description,
    status: input.status,
    userId: session.user.id,
  });
  revalidatePath('/tasks');
  return task;
}

export async function updateTaskAction(input: {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
}): Promise<Task> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const update = new UpdateTaskService(tasksRepo, usersRepo);
  const task = await update.execute({
    id: input.id,
    title: input.title,
    description: input.description,
    status: input.status,
    userId: session.user.id,
  });
  revalidatePath('/tasks');
  return task;
}

export async function updateTaskStatusAction(input: {
  taskId: string;
  status: TaskStatus;
}): Promise<Task> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const updateStatus = new UpdateTaskStatusService(tasksRepo, usersRepo);
  const task = await updateStatus.execute({
    taskId: input.taskId,
    status: input.status,
    userId: session.user.id,
  });
  revalidatePath('/tasks');
  return task;
}

export async function deleteTaskAction(input: { id: string }): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const del = new DeleteTaskService(tasksRepo, usersRepo);
  await del.execute({ taskId: input.id, userId: session.user.id });
  revalidatePath('/tasks');
}

export async function listMyTasksAction(pagination?: Pagination): Promise<{
  items: Task[];
  nextCursor?: string | null;
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const list = new ListTasksForUserService(tasksRepo, usersRepo);
  return list.execute({ userId: session.user.id, pagination });
}
