import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogInterceptors } from './interceptors/log.interceptors';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule, { logger: false });
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['estokay-unisenai.vercel.app'],
  });

  // const logger = app.get(Logger);
  // app.useLogger(logger);

  //configura o uso de pipelines de validação, aplicada com class-validator
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LogInterceptors());

  await app.listen(3000);
}

bootstrap();
