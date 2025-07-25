// src/main.ts
console.log('--- VERCEL DEBUG: STARTING NESTJS SERVERLESS BOOTSTRAP ---');
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Callback, Context, Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer: Handler;

async function bootstrapServer(): Promise<Handler> {
  console.log('--- VERCEL DEBUG: INSIDE bootstrapServer FUNCTION !!---');
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: 'https://autill-front.vercel.app',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    await app.init();
    console.log('--- VERCEL DEBUG: NestJS App Initialized ---');
    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
  } catch (error) {
    console.error('--- VERCEL DEBUG: ERROR DURING NESTJS BOOTSTRAP ---', error);
    throw error;
  }
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  console.log('--- VERCEL DEBUG: HANDLER INVOKED --- Request Path:', event.path);
  cachedServer = cachedServer ?? (await bootstrapServer());
  return cachedServer(event, context, callback);
};