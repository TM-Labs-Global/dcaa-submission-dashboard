import { db } from '../lib/db.js';
import { users } from '../lib/db/schema.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

const ADMIN_EMAIL = 'ritchie.ngaro@takeoutmedia.xyz';
const ADMIN_PASSWORD = '@R1tch1eoflabs'; // ⚠️ REMINDER: Change this password immediately after first login for security

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    if (existingAdmin.length) {
      console.log(`⚠️  Admin user with email ${ADMIN_EMAIL} already exists`);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin user
    const newAdmin = await db
      .insert(users)
      .values({
        email: ADMIN_EMAIL,
        passwordHash,
        role: 'admin',
        status: 'active',
      })
      .returning({ id: users.id, email: users.email });

    console.log(`✅ Admin user created!`);
    console.log(`   Email: ${newAdmin[0].email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`\n⚠️  IMPORTANT: Change your password immediately after first login!`);
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
    process.exit(1);
  }
}

seedAdmin();
