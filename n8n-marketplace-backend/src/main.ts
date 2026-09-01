import './load-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded, raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';

  // Stripe webhooks need the raw, unparsed body for signature verification.
  // This must be registered before the JSON body parser.
  app.use(`/${apiPrefix}/payments/webhook`, raw({ type: '*/*' }));

  // Increase body limit
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  const frontendUrl = configService.get<string>('app.frontendUrl') || '';
  const origins = frontendUrl.includes(',') 
    ? frontendUrl.split(',').map(url => url.trim()) 
    : frontendUrl;

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  // API Prefix
  app.setGlobalPrefix(apiPrefix);

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('n8n Marketplace API')
    .setDescription('The n8n Automation Marketplace API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
