import { PasswordHasher } from '@/services/password';

export class InMemoryPasswordHasher implements PasswordHasher {
  private hashes: Map<string, string> = new Map();

  async hash(plain: string): Promise<string> {
    // Simple mock implementation - just stores the plain text with a prefix
    const hash = `hashed-${plain}`;
    this.hashes.set(hash, plain);
    return hash;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    const stored = this.hashes.get(hash);
    return stored === plain;
  }

  // Test helper methods
  clear(): void {
    this.hashes.clear();
  }
}
