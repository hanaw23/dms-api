import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Root endpoint - info API
  @Get()
  getApiInfo() {
    return this.appService.getApiInfo();
  }

  // Health check simple (untuk UptimeRobot)
  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // Health check detail (untuk monitoring)
  @Get('health/detailed')
  async detailedHealthCheck() {
    return await this.appService.getHealthStatus();
  }
}
