export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUserInput {
  email: string;
  name?: string | null;
  password: string;
}

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  userId: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  userId: string; // owner guard
}

export interface Pagination {
  limit?: number; // default 20
  cursor?: string; // opaque cursor
}
