import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithaiboxes';
const ADMIN_EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@mithaiboxes.com';
const ADMIN_PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'MithaiAdmin@2026';

const AdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    loginAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);

async function bootstrap() {
  console.log('[Bootstrap] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  const existing = await AdminUser.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`[Bootstrap] Admin user ${ADMIN_EMAIL} already exists.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await AdminUser.create({
    email: ADMIN_EMAIL.toLowerCase(),
    name: 'Ajay Kumar (Super Admin)',
    passwordHash,
    role: 'super_admin',
    isActive: true,
  });

  console.log(`[Bootstrap] Successfully created initial super_admin account:`);
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Role: super_admin`);
  console.log(`Keep credentials safe. Remove ADMIN_BOOTSTRAP_PASSWORD from environment.`);

  await mongoose.disconnect();
}

bootstrap().catch((err) => {
  console.error('[Bootstrap Error]:', err);
  process.exit(1);
});
