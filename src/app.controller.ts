import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: 'Quizzly API is running',
      version: '1.0.0',
      endpoints: {
        generate: 'POST /questions/generate',
        health: 'GET /',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
