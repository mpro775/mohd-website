import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../modules/users/schemas/user.schema';

export async function seedUsers(userModel: Model<User>) {
  const existingAdmin = await userModel.findOne({ email: 'admin@mohd.com' });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const adminUser = new userModel({
    email: 'admin@mohd.com',
    password: hashedPassword,
    name: 'محمد',
    role: UserRole.ADMIN,
    isActive: true,
  });

  await adminUser.save();
  console.log('✅ Admin user created successfully');
  console.log('   Email: admin@mohd.com');
  console.log('   Password: Admin@123');
}
