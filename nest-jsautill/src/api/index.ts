import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../app.module';
import * as express from 'express';
import * as cors from 'cors'; // 👈 importante

const server = express();

// ✅ Añadir manualmente CORS para todas las rutas
server.use(
  cors({
    origin: 'https://autill-front.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// ✅ También manejar preflight manualmente
server.options('*', cors());

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  await app.init();
}

bootstrap();

export default server;
