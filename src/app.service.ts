import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHealthStatus() {
    let dbStatus = 'disconnected';

    try {
      // Coba query simple ke database
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error: ' + error.message;
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      },
    };
  }

  // Info API basic
  getApiInfo() {
    return {
      name: 'DMS API',
      version: '1.0.0',
      description: 'NestJS + Prisma + PostgreSQL API',
      endpoints: {
        health: '/health',
        docs: '/api-docs',
      },
    };
  }
}
