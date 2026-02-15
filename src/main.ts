import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { CreateDocumentDto } from './documents/dto/create-document.dto';
import { UpdateDocumentDto } from './documents/dto/update-document.dto';
import { UpdateStatusDto } from './documents/dto/update-status.dto';
import { DocumentResponseDto } from './documents/dto/document-response.dto';
import { ApiResponseDto } from './common/dto/api-response.dto';
import { PaginatedResponseDto } from './common/dto/paginated-response.dto';
import { PaginationDto } from './common/dto/api-pagination.dto';
import { RegisterDto } from './auth/dto/register.dto';
import { LoginDto } from './auth/dto/login.dto';
import { UserResponseDto, UserAdminResponseDto } from './auth/dto/user.dto';
import { CreatePermissionRequestDto } from './permission-requests/dto/create-permission-request.dto';
import { UpdatePermissionRequestDto } from './permission-requests/dto/update-permission-request.dto';
import { PermissionRequestResponseDto } from './permission-requests/dto/permission-request-response.dto';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Static Files
  const uploadsPath = join(process.cwd(), 'uploads');

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API Documentation for Your App')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      CreateDocumentDto,
      UpdateDocumentDto,
      UpdateStatusDto,
      DocumentResponseDto,
      ApiResponseDto,
      PaginatedResponseDto,
      PaginationDto,
      RegisterDto,
      LoginDto,
      UserResponseDto,
      UserAdminResponseDto,
      CreatePermissionRequestDto,
      UpdatePermissionRequestDto,
      PermissionRequestResponseDto,
    ],
  });
  SwaggerModule.setup('api-docs', app, document);

  const cors = {
    origin: ['http://localhost:3000', 'http://localhost', '*'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['*'],
  };

  app.enableCors(cors);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
