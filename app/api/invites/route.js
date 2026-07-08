import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { invites, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// GET — validate an invite token (unauthenticated)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return Response.json({ valid: false, message: 'Token is required' }, { status: 400 });
  }

  try {
    const invite = await db.select().from(invites).where(eq(invites.token, token)).limit(1);

    if (!invite.length) {
      return Response.json(
        { valid: false, message: 'Invite not found' },
        { status: 404 }
      );
    }

    const inviteData = invite[0];

    if (inviteData.usedAt) {
      return Response.json(
        { valid: false, message: 'This invite has already been used' },
        { status: 400 }
      );
    }

    if (new Date() > inviteData.expiresAt) {
      return Response.json(
        { valid: false, message: 'This invite has expired' },
        { status: 400 }
      );
    }

    return Response.json({
      valid: true,
      email: inviteData.email,
    });
  } catch (error) {
    console.error('Invite validation error:', error);
    return Response.json({ valid: false, message: 'Validation failed' }, { status: 500 });
  }
}

// POST — create a new invite (admin-only) or accept an invite
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, token, password } = body;

    // Accept invite action (unauthenticated)
    if (action === 'accept') {
      if (!token || !password) {
        return Response.json(
          { message: 'Token and password are required' },
          { status: 400 }
        );
      }

      const invite = await db.select().from(invites).where(eq(invites.token, token)).limit(1);

      if (!invite.length) {
        return Response.json(
          { message: 'Invite not found' },
          { status: 404 }
        );
      }

      const inviteData = invite[0];

      if (inviteData.usedAt) {
        return Response.json(
          { message: 'This invite has already been used' },
          { status: 400 }
        );
      }

      if (new Date() > inviteData.expiresAt) {
        return Response.json(
          { message: 'This invite has expired' },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Email-tied invite already has a known email. Link-only invites have
      // none — the person accepting supplies their own email now.
      const userEmail = inviteData.email || email;

      if (!userEmail) {
        return Response.json(
          { message: 'Email is required' },
          { status: 400 }
        );
      }

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      if (existingUser.length) {
        if (!inviteData.email && existingUser[0].status !== 'pending') {
          // Link-only invite typed in an email that's already an active/paused
          // account — refuse rather than silently overwrite it.
          return Response.json(
            { message: 'This email is already registered' },
            { status: 409 }
          );
        }

        await db
          .update(users)
          .set({
            passwordHash,
            status: 'active',
          })
          .where(eq(users.email, userEmail));
      } else {
        await db.insert(users).values({
          email: userEmail,
          passwordHash,
          role: 'viewer',
          status: 'active',
        });
      }

      // Mark invite as used
      await db.update(invites).set({ usedAt: new Date() }).where(eq(invites.token, token));

      return Response.json({ message: 'Account activated' }, { status: 200 });
    }

    // Create invite action (admin-only)
    const session = await auth();

    if (!session || session.user?.role !== 'admin') {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Generate token
    const token_new = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Email-tied invite (Send Email tab): create/reuse the pending user now.
    // Link-only invite (Generate Link tab): no email yet — the person supplies
    // their own email when they accept the invite.
    if (email) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!existingUser.length) {
        await db.insert(users).values({
          email,
          role: 'viewer',
          status: 'pending',
        });
      }
    }

    // Create invite
    const newInvite = await db
      .insert(invites)
      .values({
        email: email || null,
        token: token_new,
        createdBy: session.user.id,
        expiresAt,
      })
      .returning({ token: invites.token });

    return Response.json(
      {
        token: newInvite[0].token,
        email,
        expiresAt: expiresAt.toISOString(),
        inviteLink: `${process.env.NEXTAUTH_URL}/invite/${newInvite[0].token}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Invite creation error:', error);
    return Response.json({ message: 'Failed to process invite' }, { status: 500 });
  }
}
