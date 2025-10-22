import {
  NewTaskInput,
  NewUserInput,
  Pagination,
  Task,
  TaskStatus,
  UpdateTaskInput,
  User,
} from './types';

export interface UserRepository {
  create(input: NewUserInput & { passwordHash: string }): Promise<User>;
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateName(userId: string, name: string | null): Promise<User>;
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
  deleteById(userId: string): Promise<void>;
}

export interface TaskRepository {
  create(input: NewTaskInput & { status: TaskStatus }): Promise<Task>;
  findById(taskId: string): Promise<Task | null>;
  listByUser(
    userId: string,
    pagination?: Pagination
  ): Promise<{ items: Task[]; nextCursor?: string | null }>;
  update(input: UpdateTaskInput): Promise<Task>;
  updateStatus(
    taskId: string,
    userId: string,
    status: TaskStatus
  ): Promise<Task>;
  delete(taskId: string, userId: string): Promise<void>;
}
