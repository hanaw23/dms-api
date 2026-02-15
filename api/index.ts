// api/index.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: console },
    );
    nestApp.enableCors();
    await nestApp.init();
    app = nestApp;
  }
  return server;
}

export default async (req: Request, res: Response) => {
  try {
    const expressApp = await bootstrap();
    expressApp(req, res);
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
