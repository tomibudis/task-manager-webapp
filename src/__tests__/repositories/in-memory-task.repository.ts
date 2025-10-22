import {
  NewTaskInput,
  Pagination,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '@/domain/types';
import { TaskRepository } from '@/domain/repositories';

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [];
  private idCounter = 1;

  async create(input: NewTaskInput & { status: TaskStatus }): Promise<Task> {
    const now = new Date();
    const task: Task = {
      id: `task-${this.idCounter++}`,
      title: input.title,
      description: input.description || '',
      status: input.status,
      userId: input.userId,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return task;
  }

  async findById(taskId: string): Promise<Task | null> {
    return this.tasks.find((t) => t.id === taskId) || null;
  }

  async listByUser(
    userId: string,
    pagination?: Pagination,
    status?: TaskStatus
  ): Promise<{ items: Task[]; nextCursor?: string | null }> {
    let filtered = this.tasks.filter((t) => t.userId === userId);

    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    // Sort by createdAt descending
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const limit = pagination?.limit || 20;
    const cursor = pagination?.cursor;

    let startIndex = 0;
    if (cursor) {
      startIndex = filtered.findIndex((t) => t.id === cursor);
      if (startIndex === -1) startIndex = 0;
      else startIndex += 1;
    }

    const items = filtered.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < filtered.length ? items[items.length - 1].id : null;

    return { items, nextCursor };
  }

  async update(input: UpdateTaskInput): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === input.id);
    if (index === -1) {
      throw new Error('Task not found');
    }

    const existing = this.tasks[index];
    const updated: Task = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      status: input.status ?? existing.status,
      updatedAt: new Date(),
    };

    this.tasks[index] = updated;
    return updated;
  }

  async updateStatus(
    taskId: string,
    userId: string,
    status: TaskStatus
  ): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error('Task not found');
    }

    const existing = this.tasks[index];
    const updated: Task = {
      ...existing,
      status,
      updatedAt: new Date(),
    };

    this.tasks[index] = updated;
    return updated;
  }

  async delete(taskId: string, userId: string): Promise<void> {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error('Task not found');
    }
    this.tasks.splice(index, 1);
  }

  // Test helper methods
  clear(): void {
    this.tasks = [];
    this.idCounter = 1;
  }

  getAll(): Task[] {
    return [...this.tasks];
  }
}
