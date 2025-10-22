import bcrypt from 'bcryptjs';

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds: number;
  constructor(saltRounds = 12) {
    this.saltRounds = saltRounds;
  }
  async hash(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(plain, salt);
  }
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
