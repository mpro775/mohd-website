import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserRole } from '../../modules/users/schemas/user.schema';

export async function seedAdminUser(userModel: Model<User>) {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  let password = process.env.SEED_ADMIN_PASSWORD;

  if (!password) {
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.NODE_ENV === 'provision'
    ) {
      throw new Error('SEED_ADMIN_PASSWORD is required outside development');
    }
    password = randomBytes(18).toString('base64url');
  }

  const existingAdmin = await userModel.findOne({ email });
  if (existingAdmin) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userModel.create({
    email,
    password: hashedPassword,
    name,
    role: UserRole.ADMIN,
    isActive: true,
  });

  console.log(`Admin user created: ${email}`);
  if (
    !process.env.SEED_ADMIN_PASSWORD &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.log(`Generated development password: ${password}`);
  }
}
