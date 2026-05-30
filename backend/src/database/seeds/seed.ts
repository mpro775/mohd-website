import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../modules/users/schemas/user.schema';
import { Profile } from '../../modules/profile/schemas/profile.schema';
import { seedUsers } from './user.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('🌱 Starting database seeding...\n');

    // Get models
    const userModel = app.get(getModelToken(User.name));
    const profileModel = app.get(getModelToken(Profile.name));

    // Seed users
    await seedUsers(userModel);

    // Seed initial profile (optional)
    const existingProfile = await profileModel.findOne();
    if (!existingProfile) {
      const profile = new profileModel({
        fullName: 'محمد',
        title: 'مطور برمجيات Full Stack',
        bio: 'مطور برمجيات متخصص في تطوير تطبيقات الويب باستخدام تقنيات حديثة',
        email: 'contact@mohd.com',
        yearsOfExperience: 3,
        socialLinks: [],
        certificates: [],
      });
      await profile.save();
      console.log('✅ Initial profile created');
    }

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
