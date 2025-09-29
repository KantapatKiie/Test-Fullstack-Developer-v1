import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/user.dto';
import { UserRole } from './users/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminUser: CreateUserDto = {
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    };

    // Create regular user
    const regularUser: CreateUserDto = {
      email: 'user@test.com',
      password: 'password123',
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
    };

    // Check if users already exist
    try {
      const existingAdmin = await usersService.findByEmail(adminUser.email);
      if (!existingAdmin) {
        await usersService.create(adminUser);
        console.log('✅ Admin user created:', adminUser.email);
      } else {
        console.log('ℹ️ Admin user already exists:', adminUser.email);
      }
    } catch (error) {
      await usersService.create(adminUser);
      console.log('✅ Admin user created:', adminUser.email);
    }

    try {
      const existingUser = await usersService.findByEmail(regularUser.email);
      if (!existingUser) {
        await usersService.create(regularUser);
        console.log('✅ Regular user created:', regularUser.email);
      } else {
        console.log('ℹ️ Regular user already exists:', regularUser.email);
      }
    } catch (error) {
      await usersService.create(regularUser);
      console.log('✅ Regular user created:', regularUser.email);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('Admin: admin@test.com / password123');
    console.log('User:  user@test.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();