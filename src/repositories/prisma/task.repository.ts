import prisma from '@/data/prisma/client';
import { TaskRepository } from '@/domain/repositories';
import {
  NewTaskInput,
  Pagination,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '@/domain/types';

export class PrismaTaskRepository implements TaskRepository {
  async create(input: NewTaskInput & { status: TaskStatus }): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description ?? '',
        status: input.status,
        userId: input.userId,
      },
    });
    return task as unknown as Task;
  }

  async findById(taskId: string): Promise<Task | null> {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    return task as unknown as Task | null;
  }

  async listByUser(
    userId: string,
    pagination?: Pagination,
    status?: TaskStatus
  ): Promise<{ items: Task[]; nextCursor?: string | null }> {
    const limit = Math.min(Math.max(pagination?.limit ?? 20, 1), 100);
    const cursor = pagination?.cursor ? { id: pagination.cursor } : undefined;
    const items = await prisma.task.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor } : {}),
      orderBy: { createdAt: 'desc' },
    });
    let nextCursor: string | null = null;
    if (items.length > limit) {
      const next = items.pop();
      nextCursor = next ? next.id : null;
    }
    return { items: items as unknown as Task[], nextCursor };
  }

  async update(input: UpdateTaskInput): Promise<Task> {
    const task = await prisma.task.update({
      where: { id: input.id, userId: input.userId },
      data: {
        title: input.title,
        description: input.description,
        status: input.status,
      },
    });
    return task as unknown as Task;
  }

  async updateStatus(
    taskId: string,
    userId: string,
    status: TaskStatus
  ): Promise<Task> {
    const task = await prisma.task.update({
      where: { id: taskId, userId },
      data: { status },
    });
    return task as unknown as Task;
  }

  async delete(taskId: string, userId: string): Promise<void> {
    await prisma.task.delete({ where: { id: taskId, userId } });
  }
}
