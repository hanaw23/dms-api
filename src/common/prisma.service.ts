import { PrismaClient, Prisma } from '@prisma/client';
import { Logger } from 'winston';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, string>
  implements OnModuleInit
{
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {
    // Setup PostgreSQL adapter untuk Prisma v7
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();

    this.$on('query', (e) => {
      this.logger.info(e);
    });
    this.$on('info', (e) => {
      this.logger.info(e);
    });
    this.$on('warn', (e) => {
      this.logger.warn(e);
    });
    this.$on('error', (e) => {
      this.logger.error(e);
    });
  }
}
