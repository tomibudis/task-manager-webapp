import {
  CreateTask,
  DeleteTask,
  ListTasksForUser,
  UpdateTask,
  UpdateTaskStatus,
} from '@/domain/usecases';
import {
  NewTaskInput,
  Pagination,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '@/domain/types';
import { TaskRepository, UserRepository } from '@/domain/repositories';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/domain/errors';

export class CreateTaskService implements CreateTask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly users: UserRepository
  ) {}
  async execute(
    input: Omit<NewTaskInput, 'status'> & { status?: TaskStatus }
  ): Promise<Task> {
    const user = await this.users.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');
    const title = (input.title ?? '').trim();
    if (!title) throw new ValidationError('Task title is required');
    const description = (input.description ?? '').trim();
    const status = input.status ?? 'TODO';
    return this.tasks.create({
      title,
      description,
      status,
      userId: input.userId,
    });
  }
}

export class UpdateTaskService implements UpdateTask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly users: UserRepository
  ) {}
  async execute(input: UpdateTaskInput): Promise<Task> {
    const user = await this.users.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');
    const existing = await this.tasks.findById(input.id);
    if (!existing) throw new NotFoundError('Task not found');
    if (existing.userId !== input.userId)
      throw new UnauthorizedError('Cannot modify task you do not own');
    const update: UpdateTaskInput = {
      id: input.id,
      userId: input.userId,
      title: input.title?.trim(),
      description: input.description?.trim(),
      status: input.status,
    };
    return this.tasks.update(update);
  }
}

export class UpdateTaskStatusService implements UpdateTaskStatus {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly users: UserRepository
  ) {}
  async execute(input: {
    taskId: string;
    userId: string;
    status: TaskStatus;
  }): Promise<Task> {
    const user = await this.users.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');
    const existing = await this.tasks.findById(input.taskId);
    if (!existing) throw new NotFoundError('Task not found');
    if (existing.userId !== input.userId)
      throw new UnauthorizedError('Cannot modify task you do not own');
    return this.tasks.updateStatus(input.taskId, input.userId, input.status);
  }
}

export class ListTasksForUserService implements ListTasksForUser {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly users: UserRepository
  ) {}
  async execute(input: {
    userId: string;
    pagination?: Pagination;
    status?: TaskStatus;
  }): Promise<{ items: Task[]; nextCursor?: string | null }> {
    const user = await this.users.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');
    return this.tasks.listByUser(input.userId, input.pagination, input.status);
  }
}

export class DeleteTaskService implements DeleteTask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly users: UserRepository
  ) {}
  async execute(input: { taskId: string; userId: string }): Promise<void> {
    const user = await this.users.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');
    const existing = await this.tasks.findById(input.taskId);
    if (!existing) throw new NotFoundError('Task not found');
    if (existing.userId !== input.userId)
      throw new UnauthorizedError('Cannot delete task you do not own');
    await this.tasks.delete(input.taskId, input.userId);
  }
}
