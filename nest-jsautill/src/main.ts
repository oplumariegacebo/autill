import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /*app.setGlobalPrefix('api/v1');
  app.use(function (request: Request, response: Response, next: NextFunction) {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    next();
  });*/
  app.enableCors({
    origin: 'https://autill-front.vercel.app',
    methods: '*',
    credentials: true,
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();