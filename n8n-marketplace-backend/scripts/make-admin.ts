
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email address as an argument.');
    process.exit(1);
  }

  const user = await usersService.findByEmail(email);
  if (!user) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  console.log(`Found user: ${user.email} (${user._id})`);
  
  if (user.roles.includes('admin')) {
    console.log('User is already an admin.');
  } else {
    await usersService.updateRole(user._id.toString(), 'admin');
    console.log(`Successfully made ${email} an admin.`);
  }

  await app.close();
  process.exit(0);
}

bootstrap();
