import { describe, it, expect, beforeEach } from 'vitest';
import {
  CreateTaskService,
  UpdateTaskService,
  UpdateTaskStatusService,
  ListTasksForUserService,
  DeleteTaskService,
} from '@/usecases/task';
import { InMemoryTaskRepository } from '../repositories/in-memory-task.repository';
import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';
import { TaskStatus } from '@/domain/types';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/domain/errors';

describe('Task Use Cases', () => {
  let taskRepo: InMemoryTaskRepository;
  let userRepo: InMemoryUserRepository;
  let userId: string;

  beforeEach(async () => {
    taskRepo = new InMemoryTaskRepository();
    userRepo = new InMemoryUserRepository();

    // Create a test user
    const user = await userRepo.create({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      passwordHash: 'hashed-password123',
    });
    userId = user.id;
  });

  describe('CreateTaskService', () => {
    it('should create a task successfully', async () => {
      const service = new CreateTaskService(taskRepo, userRepo);
      const task = await service.execute({
        title: 'Test Task',
        description: 'Test Description',
        userId,
      });

      expect(task).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.status).toBe('TODO');
      expect(task.userId).toBe(userId);
    });

    it('should trim title and description', async () => {
      const service = new CreateTaskService(taskRepo, userRepo);
      const task = await service.execute({
        title: '  Test Task  ',
        description: '  Test Description  ',
        userId,
      });

      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
    });

    it('should use provided status', async () => {
      const service = new CreateTaskService(taskRepo, userRepo);
      const task = await service.execute({
        title: 'Test Task',
        description: 'Test Description',
        status: 'IN_PROGRESS',
        userId,
      });

      expect(task.status).toBe('IN_PROGRESS');
    });

    it('should default to TODO status when not provided', async () => {
      const service = new CreateTaskService(taskRepo, userRepo);
      const task = await service.execute({
        title: 'Test Task',
        description: 'Test Description',
        userId,
      });

      expect(task.status).toBe('TODO');
    });

    it('should throw ValidationError when title is empty', async () => {
      const service = new CreateTaskService(taskRepo, userRepo);
      await expect(
        service.execute({
          title: '',
          description: 'Test Description',
          userId,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when title is only whitespace', async () => {
      const service = new CreateTaskService(taskRepo, userRepo);
      await expect(
        service.execute({
          title: '   ',
          description: 'Test Description',
          userId,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const service = new CreateTaskService(taskRepo, userRepo);
      await expect(
        service.execute({
          title: 'Test Task',
          description: 'Test Description',
          userId: 'non-existent-user',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('UpdateTaskService', () => {
    let taskId: string;

    beforeEach(async () => {
      const service = new CreateTaskService(taskRepo, userRepo);
      const task = await service.execute({
        title: 'Original Task',
        description: 'Original Description',
        userId,
      });
      taskId = task.id;
    });

    it('should update task successfully', async () => {
      const service = new UpdateTaskService(taskRepo, userRepo);
      const updated = await service.execute({
        id: taskId,
        title: 'Updated Task',
        description: 'Updated Description',
        userId,
      });

      expect(updated.title).toBe('Updated Task');
      expect(updated.description).toBe('Updated Description');
    });

    it('should update only provided fields', async () => {
      const service = new UpdateTaskService(taskRepo, userRepo);
      const updated = await service.execute({
        id: taskId,
        title: 'Updated Task',
        userId,
      });

      expect(updated.title).toBe('Updated Task');
      expect(updated.description).toBe('Original Description');
    });

    it('should trim title and description', async () => {
      const service = new UpdateTaskService(taskRepo, userRepo);
      const updated = await service.execute({
        id: taskId,
        title: '  Updated Task  ',
        description: '  Updated Description  ',
        userId,
      });

      expect(updated.title).toBe('Updated Task');
      expect(updated.description).toBe('Updated Description');
    });

    it('should throw NotFoundError when task does not exist', async () => {
      const service = new UpdateTaskService(taskRepo, userRepo);
      await expect(
        service.execute({
          id: 'non-existent-task',
          title: 'Updated Task',
          userId,
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError when user does not own the task', async () => {
      const otherUser = await userRepo.create({
        email: 'other@example.com',
        name: 'Other User',
        password: 'password123',
        passwordHash: 'hashed-password123',
      });

      const service = new UpdateTaskService(taskRepo, userRepo);
      await expect(
        service.execute({
          id: taskId,
          title: 'Updated Task',
          userId: otherUser.id,
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const service = new UpdateTaskService(taskRepo, userRepo);
      await expect(
        service.execute({
          id: taskId,
          title: 'Updated Task',
          userId: 'non-existent-user',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('UpdateTaskStatusService', () => {
    let taskId: string;

    beforeEach(async () => {
      const service = new CreateTaskService(taskRepo, userRepo);
      const task = await service.execute({
        title: 'Test Task',
        description: 'Test Description',
        userId,
      });
      taskId = task.id;
    });

    it('should update task status successfully', async () => {
      const service = new UpdateTaskStatusService(taskRepo, userRepo);
      const updated = await service.execute({
        taskId,
        userId,
        status: 'IN_PROGRESS',
      });

      expect(updated.status).toBe('IN_PROGRESS');
    });

    it('should allow all status transitions', async () => {
      const service = new UpdateTaskStatusService(taskRepo, userRepo);

      const todoToInProgress = await service.execute({
        taskId,
        userId,
        status: 'IN_PROGRESS',
      });
      expect(todoToInProgress.status).toBe('IN_PROGRESS');

      const inProgressToDone = await service.execute({
        taskId,
        userId,
        status: 'DONE',
      });
      expect(inProgressToDone.status).toBe('DONE');

      const doneToTodo = await service.execute({
        taskId,
        userId,
        status: 'TODO',
      });
      expect(doneToTodo.status).toBe('TODO');
    });

    it('should throw NotFoundError when task does not exist', async () => {
      const service = new UpdateTaskStatusService(taskRepo, userRepo);
      await expect(
        service.execute({
          taskId: 'non-existent-task',
          userId,
          status: 'IN_PROGRESS',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError when user does not own the task', async () => {
      const otherUser = await userRepo.create({
        email: 'other@example.com',
        name: 'Other User',
        password: 'password123',
        passwordHash: 'hashed-password123',
      });

      const service = new UpdateTaskStatusService(taskRepo, userRepo);
      await expect(
        service.execute({
          taskId,
          userId: otherUser.id,
          status: 'IN_PROGRESS',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('ListTasksForUserService', () => {
    beforeEach(async () => {
      const service = new CreateTaskService(taskRepo, userRepo);

      // Create multiple tasks
      await service.execute({
        title: 'Task 1',
        description: 'Description 1',
        status: 'TODO',
        userId,
      });
      await service.execute({
        title: 'Task 2',
        description: 'Description 2',
        status: 'IN_PROGRESS',
        userId,
      });
      await service.execute({
        title: 'Task 3',
        description: 'Description 3',
        status: 'DONE',
        userId,
      });
    });

    it('should list all tasks for user', async () => {
      const service = new ListTasksForUserService(taskRepo, userRepo);
      const result = await service.execute({ userId });

      expect(result.items).toHaveLength(3);
      expect(result.items.every((t) => t.userId === userId)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const service = new ListTasksForUserService(taskRepo, userRepo);
      const result = await service.execute({ userId, status: 'TODO' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('TODO');
    });

    it('should paginate results', async () => {
      const service = new ListTasksForUserService(taskRepo, userRepo);
      const result = await service.execute({
        userId,
        pagination: { limit: 2 },
      });

      expect(result.items).toHaveLength(2);
    });

    it('should return empty array when no tasks exist', async () => {
      const newUser = await userRepo.create({
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        passwordHash: 'hashed-password123',
      });

      const service = new ListTasksForUserService(taskRepo, userRepo);
      const result = await service.execute({ userId: newUser.id });

      expect(result.items).toHaveLength(0);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const service = new ListTasksForUserService(taskRepo, userRepo);
      await expect(
        service.execute({ userId: 'non-existent-user' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('DeleteTaskService', () => {
    let taskId: string;

    beforeEach(async () => {
      const service = new CreateTaskService(taskRepo, userRepo);
      const task = await service.execute({
        title: 'Test Task',
        description: 'Test Description',
        userId,
      });
      taskId = task.id;
    });

    it('should delete task successfully', async () => {
      const service = new DeleteTaskService(taskRepo, userRepo);
      await service.execute({ taskId, userId });

      const task = await taskRepo.findById(taskId);
      expect(task).toBeNull();
    });

    it('should throw NotFoundError when task does not exist', async () => {
      const service = new DeleteTaskService(taskRepo, userRepo);
      await expect(
        service.execute({ taskId: 'non-existent-task', userId })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError when user does not own the task', async () => {
      const otherUser = await userRepo.create({
        email: 'other@example.com',
        name: 'Other User',
        password: 'password123',
        passwordHash: 'hashed-password123',
      });

      const service = new DeleteTaskService(taskRepo, userRepo);
      await expect(
        service.execute({ taskId, userId: otherUser.id })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const service = new DeleteTaskService(taskRepo, userRepo);
      await expect(
        service.execute({ taskId, userId: 'non-existent-user' })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
