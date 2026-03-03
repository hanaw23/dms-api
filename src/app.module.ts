import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { PermissionRequestsModule } from './permission-requests/permission-requests.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { DocumentFilesModule } from './document-files/document-files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    DocumentsModule,
    PermissionRequestsModule,
    DocumentFilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
