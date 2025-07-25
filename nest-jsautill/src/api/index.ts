import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../app.module';
import * as express from 'express';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    allowedHeaders: '*',
    origin: 'https://autill-front.vercel.app',
    methods: '*',
    credentials: true,
  });

  await app.init();
}

bootstrap();

export default server;