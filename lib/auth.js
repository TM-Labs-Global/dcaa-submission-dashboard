import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db.js';
import { users } from './db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, String(credentials.email)))
          .limit(1);
console.log('User fetched from database:', user);
        if (!user.length) {
          throw new Error('Invalid email or password');
        }

        const userData = user[0];

        if (userData.status !== 'active') {
          throw new Error('PENDING_APPROVAL');
        }

        if (!userData.passwordHash) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(
          String(credentials.password),
          userData.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: userData.id,
          email: userData.email,
          role: userData.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});

export async function isAdmin(session) {
  return session?.user?.role === 'admin';
}

export async function isViewer(session) {
  return session?.user?.role === 'viewer';
}
