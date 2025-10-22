import { ChangePasswordInput, NewUserInput, PublicUser } from '@/domain/types';
import { UserRepository } from '@/domain/repositories';
import {
  ChangePassword,
  RegisterUser,
  AuthenticateUser,
  GetCurrentUserProfile,
} from '@/domain/usecases';
import { ValidationError, NotFoundError } from '@/domain/errors';
import { PasswordHasher } from '@/services/password';

function toPublic(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class RegisterUserService implements RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(input: NewUserInput): Promise<PublicUser> {
    const email = input.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('Invalid email');
    }
    if (!input.password || input.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ValidationError('Email already in use');
    }
    const passwordHash = await this.hasher.hash(input.password);
    const created = await this.users.create({
      email,
      name: input.name ?? null,
      password: input.password,
      passwordHash,
    });
    return toPublic(created);
  }
}

export class AuthenticateUserService implements AuthenticateUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(input: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser } | null> {
    const email = input.email?.trim().toLowerCase();
    if (!email || !input.password) {
      throw new ValidationError('Email and password are required');
    }
    const user = await this.users.findByEmail(email);
    if (!user) return null;
    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) return null;
    return { user: toPublic(user) };
  }
}

export class GetCurrentUserProfileService implements GetCurrentUserProfile {
  constructor(private readonly users: UserRepository) {}
  async execute(input: { userId: string }): Promise<PublicUser> {
    const user = await this.users.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');
    return toPublic(user);
  }
}

export class ChangePasswordService implements ChangePassword {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher
  ) {}
  async execute(input: ChangePasswordInput): Promise<void> {
    if (!input.newPassword || input.newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters');
    }
    const user = await this.users.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');
    const ok = await this.hasher.compare(
      input.currentPassword,
      user.passwordHash
    );
    if (!ok) {
      throw new ValidationError('Current password is incorrect');
    }
    const newHash = await this.hasher.hash(input.newPassword);
    await this.users.updatePasswordHash(input.userId, newHash);
  }
}
