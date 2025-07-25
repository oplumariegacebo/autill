import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Callback, Context, Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer: Handler; 

async function bootstrapServer(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://autill-front.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.init(); 
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  cachedServer = cachedServer ?? (await bootstrapServer());
  return cachedServer(event, context, callback);
};