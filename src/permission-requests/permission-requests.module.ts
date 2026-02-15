import { Module } from '@nestjs/common';
import { PermissionRequestsController } from './permission-requests.controller';
import { PermissionRequestsService } from './permission-requests.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionRequestsController],
  providers: [PermissionRequestsService],
})
export class PermissionRequestsModule {}
