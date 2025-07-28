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
    origin: ['https://autill-front.vercel.app', 'http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Handler global para OPTIONS (preflight)
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.status(200).json({});
    }
    next();
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();