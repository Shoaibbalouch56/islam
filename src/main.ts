import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

async function bootstrap() {
  if (process.env.DATABASE_URL) {
    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'ignore',
      });
    } catch (e) {
      console.error('Database migration failed:', e);
    }
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'log'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const appName = process.env.APP_NAME ?? 'Door-to-Door Islam';
  const config = new DocumentBuilder()
    .setTitle(`${appName} API`)
    .setDescription('Authentication API for Door-to-Door Islam')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const firebaseKeyPath = path.join(
    process.cwd(),
    'firebase-service-account.json',
  );

  if (fs.existsSync(firebaseKeyPath)) {
    const fileContent = fs.readFileSync(firebaseKeyPath, 'utf8');
    const adminConfig = JSON.parse(fileContent) as ServiceAccount;
    admin.initializeApp({
      credential: admin.credential.cert(adminConfig),
    });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const adminConfig = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
      ) as ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(adminConfig),
      });
    } catch (e) {
      console.error('Firebase Admin init failed:', e);
    }
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api`);
}
bootstrap().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
