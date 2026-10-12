import { db } from '../lib/db.js';
import { users } from '../lib/db/schema.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

const ADMINS = [];

if (process.env.ADMIN_EMAIL_1 && process.env.ADMIN_PASSWORD_1) {
  ADMINS.push({ email: process.env.ADMIN_EMAIL_1, password: process.env.ADMIN_PASSWORD_1 });
}
if (process.env.ADMIN_EMAIL_2 && process.env.ADMIN_PASSWORD_2) {
  ADMINS.push({ email: process.env.ADMIN_EMAIL_2, password: process.env.ADMIN_PASSWORD_2 });
}

async function seedAdmins() {
  try {
    console.log('🌱 Seeding admin users...');

    for (const admin of ADMINS) {
      const passwordHash = await bcrypt.hash(admin.password, 10);

      // Check if admin already exists
      const existingAdmin = await db
        .select()
        .from(users)
        .where(eq(users.email, admin.email))
        .limit(1);

      if (existingAdmin.length) {
        // Update existing admin: sync password and ensure status is active
        await db
          .update(users)
          .set({ passwordHash, status: 'active' })
          .where(eq(users.email, admin.email));
        console.log(`🔄 Updated password for existing admin: ${admin.email}`);
      } else {
        // Insert new admin
        const newAdmin = await db
          .insert(users)
          .values({
            email: admin.email,
            passwordHash,
            role: 'admin',
            status: 'active',
          })
          .returning({ id: users.id, email: users.email });
        console.log(`✅ Admin user created! Email: ${newAdmin[0].email}`);
      }
    }
    console.log('🎉 Seeding completed!');
  } catch (error) {
    console.error('❌ Failed to seed admins:', error);
    process.exit(1);
  }
}

seedAdmins();
