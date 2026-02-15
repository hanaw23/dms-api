import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';

const expressApp = express();

let app: any;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    app.enableCors();
    await app.init();
  }
  return app;
}

export default async (req: any, res: any) => {
  await createApp();
  return expressApp(req, res);
};
