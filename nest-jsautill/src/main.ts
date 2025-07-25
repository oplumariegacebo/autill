import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

bootstrap();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://autill-front.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();