import {
  ChangePasswordInput,
  NewTaskInput,
  NewUserInput,
  Pagination,
  PublicUser,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from './types';

export interface RegisterUser {
  execute(input: NewUserInput): Promise<PublicUser>;
}

export interface AuthenticateUser {
  execute(input: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser } | null>;
}

export interface GetCurrentUserProfile {
  execute(input: { userId: string }): Promise<PublicUser>;
}

export interface CreateTask {
  execute(
    input: Omit<NewTaskInput, 'status'> & { status?: TaskStatus }
  ): Promise<Task>;
}

export interface UpdateTask {
  execute(input: UpdateTaskInput): Promise<Task>;
}

export interface UpdateTaskStatus {
  execute(input: {
    taskId: string;
    userId: string;
    status: TaskStatus;
  }): Promise<Task>;
}

export interface ListTasksForUser {
  execute(input: {
    userId: string;
    pagination?: Pagination;
    status?: TaskStatus;
  }): Promise<{ items: Task[]; nextCursor?: string | null }>;
}

export interface DeleteTask {
  execute(input: { taskId: string; userId: string }): Promise<void>;
}

export interface ChangePassword {
  execute(input: ChangePasswordInput): Promise<void>;
}
