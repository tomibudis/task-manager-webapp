import { describe, it, expect, beforeEach } from 'vitest';
import {
  RegisterUserService,
  AuthenticateUserService,
  GetCurrentUserProfileService,
  ChangePasswordService,
} from '@/usecases/user';
import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';
import { InMemoryPasswordHasher } from '../repositories/in-memory-password-hasher';
import { NotFoundError, ValidationError } from '@/domain/errors';

describe('User Use Cases', () => {
  let userRepo: InMemoryUserRepository;
  let passwordHasher: InMemoryPasswordHasher;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    passwordHasher = new InMemoryPasswordHasher();
  });

  describe('RegisterUserService', () => {
    it('should register a user successfully', async () => {
      const service = new RegisterUserService(userRepo, passwordHasher);
      const result = await service.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.id).toBeDefined();
      expect(result.passwordHash).toBeUndefined();
    });

    it('should handle user without name', async () => {
      const service = new RegisterUserService(userRepo, passwordHasher);
      const result = await service.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.email).toBe('test@example.com');
      expect(result.name).toBeNull();
    });

    it('should lowercase email', async () => {
      const service = new RegisterUserService(userRepo, passwordHasher);
      const result = await service.execute({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });

      expect(result.email).toBe('test@example.com');
    });

    it('should trim email', async () => {
      const service = new RegisterUserService(userRepo, passwordHasher);
      const result = await service.execute({
        email: '  test@example.com  ',
        password: 'password123',
      });

      expect(result.email).toBe('test@example.com');
    });

    it('should hash password', async () => {
      const service = new RegisterUserService(userRepo, passwordHasher);
      await service.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      const user = await userRepo.findByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user?.passwordHash).toBe('hashed-password123');
    });

    it('should throw ValidationError for invalid email', async () => {
      const service = new RegisterUserService(userRepo, passwordHasher);
      await expect(
        service.execute({
          email: 'invalid-email',
          password: 'password123',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty email', async () => {
      const service = new RegisterUserService(userRepo, passwordHasher);
      await expect(
        service.execute({
          email: '',
          password: 'password123',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for short password', async () => {
      const service = new RegisterUserService(userRepo, passwordHasher);
      await expect(
        service.execute({
          email: 'test@example.com',
          password: 'short',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate email', async () => {
      const service = new RegisterUserService(userRepo, passwordHasher);
      await service.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      await expect(
        service.execute({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('AuthenticateUserService', () => {
    beforeEach(async () => {
      const registerService = new RegisterUserService(userRepo, passwordHasher);
      await registerService.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });
    });

    it('should authenticate user with correct credentials', async () => {
      const service = new AuthenticateUserService(userRepo, passwordHasher);
      const result = await service.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result?.user.email).toBe('test@example.com');
      expect(result?.user.name).toBe('Test User');
    });

    it('should return null for incorrect password', async () => {
      const service = new AuthenticateUserService(userRepo, passwordHasher);
      const result = await service.execute({
        email: 'test@example.com',
        password: 'wrong-password',
      });

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const service = new AuthenticateUserService(userRepo, passwordHasher);
      const result = await service.execute({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(result).toBeNull();
    });

    it('should handle case-insensitive email', async () => {
      const service = new AuthenticateUserService(userRepo, passwordHasher);
      const result = await service.execute({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result?.user.email).toBe('test@example.com');
    });

    it('should trim email', async () => {
      const service = new AuthenticateUserService(userRepo, passwordHasher);
      const result = await service.execute({
        email: '  test@example.com  ',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result?.user.email).toBe('test@example.com');
    });

    it('should throw ValidationError for empty email', async () => {
      const service = new AuthenticateUserService(userRepo, passwordHasher);
      await expect(
        service.execute({
          email: '',
          password: 'password123',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty password', async () => {
      const service = new AuthenticateUserService(userRepo, passwordHasher);
      await expect(
        service.execute({
          email: 'test@example.com',
          password: '',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('GetCurrentUserProfileService', () => {
    let userId: string;

    beforeEach(async () => {
      const registerService = new RegisterUserService(userRepo, passwordHasher);
      const user = await registerService.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });
      userId = user.id;
    });

    it('should get user profile successfully', async () => {
      const service = new GetCurrentUserProfileService(userRepo);
      const result = await service.execute({ userId });

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.id).toBe(userId);
      expect(result.passwordHash).toBeUndefined();
    });

    it('should throw NotFoundError for non-existent user', async () => {
      const service = new GetCurrentUserProfileService(userRepo);
      await expect(
        service.execute({ userId: 'non-existent-user' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('ChangePasswordService', () => {
    let userId: string;

    beforeEach(async () => {
      const registerService = new RegisterUserService(userRepo, passwordHasher);
      const user = await registerService.execute({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });
      userId = user.id;
    });

    it('should change password successfully', async () => {
      const service = new ChangePasswordService(userRepo, passwordHasher);
      await service.execute({
        userId,
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      });

      const user = await userRepo.findById(userId);
      expect(user?.passwordHash).toBe('hashed-newpassword123');
    });

    it('should throw ValidationError for short new password', async () => {
      const service = new ChangePasswordService(userRepo, passwordHasher);
      await expect(
        service.execute({
          userId,
          currentPassword: 'password123',
          newPassword: 'short',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for incorrect current password', async () => {
      const service = new ChangePasswordService(userRepo, passwordHasher);
      await expect(
        service.execute({
          userId,
          currentPassword: 'wrong-password',
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError for non-existent user', async () => {
      const service = new ChangePasswordService(userRepo, passwordHasher);
      await expect(
        service.execute({
          userId: 'non-existent-user',
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
