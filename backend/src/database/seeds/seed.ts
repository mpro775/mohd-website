import 'reflect-metadata';
import * as mongoose from 'mongoose';
import { User, UserSchema } from '../../modules/users/schemas/user.schema';
import { seedAdminUser } from './user.seed';

async function bootstrap() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to seed the admin user');
  }

  await mongoose.connect(mongoUri);
  try {
    const userModel = mongoose.model<User>(User.name, UserSchema);
    await seedAdminUser(userModel);
  } finally {
    await mongoose.disconnect();
  }
}

bootstrap().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
