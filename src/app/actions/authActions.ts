'use server';
import { redirect } from 'next/navigation';
import { BcryptPasswordHasher } from '@/services/password';
import { PrismaUserRepository } from '@/repositories/prisma/user.repository';
import { NewUserInput } from '@/domain/types';

const password = new BcryptPasswordHasher();
const users = new PrismaUserRepository();

export async function signUpAction(input: NewUserInput) {
  if (!input.email || !input.password) {
    throw new Error('Email and password are required');
  }

  const existing = await users.findByEmail(input.email);
  if (existing) {
    throw new Error('Email already in use');
  }

  const passwordHash = await password.hash(input.password);
  await users.create({
    email: input.email,
    name: input.name ?? null,
    password: input.password,
    passwordHash,
  });

  redirect('/signin');
}
