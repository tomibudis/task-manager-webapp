import NextAuth from 'next-auth';
import { authOptions } from '@/auth/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
