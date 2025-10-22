import prisma from '@/data/prisma/client';
import { UserRepository } from '@/domain/repositories';
import { NewUserInput, User } from '@/domain/types';

export class PrismaUserRepository implements UserRepository {
  async create(input: NewUserInput & { passwordHash: string }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name ?? null,
        passwordHash: input.passwordHash,
      },
    });
    return user as unknown as User;
  }

  async findById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user as unknown as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user as unknown as User | null;
  }

  async updateName(userId: string, name: string | null): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    return user as unknown as User;
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string
  ): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async deleteById(userId: string): Promise<void> {
    await prisma.user.delete({ where: { id: userId } });
  }
}
