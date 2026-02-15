import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../dist/app.module';
import express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: ['error', 'warn'] },
    );

    nestApp.enableCors();
    await nestApp.init();
    app = nestApp;
  }
  return server;
}

export default async (req: any, res: any) => {
  try {
    const app = await bootstrap();
    app(req, res);
  } catch (error) {
    console.error('Bootstrap error:', error);
    res.status(500).json({
      error: 'Function initialization failed',
      message: error.message,
    });
  }
};
