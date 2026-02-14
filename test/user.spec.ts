import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserController } from '../src/user/user.controller';
import { UserService } from '../src/user/user.service';
import { PrismaService } from '../src/common/prisma.service';
import { ValidationService } from '../src/common/validation.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ErrorFilter } from '../src/common/error.filter';

describe('UserController', () => {
  let app: INestApplication;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $on: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        ValidationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Tambahkan global filter jika ada
    app.useGlobalFilters(new ErrorFilter());

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/user', () => {
    it('should be rejected if request is invalid', async () => {
      const res = await request(app.getHttpServer()).post('/api/user').send({
        username: '',
        name: '',
        role: 'USER',
        password: '',
      });
      expect(res.status).toBe(400);
    });
  });
});
