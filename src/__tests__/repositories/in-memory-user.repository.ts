import { NewUserInput, User } from '@/domain/types';
import { UserRepository } from '@/domain/repositories';

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];
  private idCounter = 1;

  async create(input: NewUserInput & { passwordHash: string }): Promise<User> {
    const now = new Date();
    const user: User = {
      id: `user-${this.idCounter++}`,
      email: input.email,
      name: input.name ?? null,
      passwordHash: input.passwordHash,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    return user;
  }

  async findById(userId: string): Promise<User | null> {
    return this.users.find((u) => u.id === userId) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async updateName(userId: string, name: string | null): Promise<User> {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error('User not found');
    }

    const updated: User = {
      ...this.users[index],
      name,
      updatedAt: new Date(),
    };

    this.users[index] = updated;
    return updated;
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string
  ): Promise<void> {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error('User not found');
    }

    this.users[index] = {
      ...this.users[index],
      passwordHash,
      updatedAt: new Date(),
    };
  }

  async deleteById(userId: string): Promise<void> {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error('User not found');
    }
    this.users.splice(index, 1);
  }

  // Test helper methods
  clear(): void {
    this.users = [];
    this.idCounter = 1;
  }

  getAll(): User[] {
    return [...this.users];
  }
}
