import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let cachedApp = null;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    // Dynamic import untuk handle path issue
    const { AppModule } = await import('../dist/app.module.js');

    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      {
        logger: console, // Enable logging untuk debug
      },
    );

    app.enableCors();
    await app.init();

    cachedApp = app;
    console.log('NestJS app initialized successfully');
    return app;
  } catch (error) {
    console.error('Failed to initialize NestJS app:', error);
    throw error;
  }
}

export default async (req, res) => {
  try {
    await bootstrap();
    return server(req, res);
  } catch (error) {
    console.error('Request handler error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
