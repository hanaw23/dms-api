import { Test, TestingModule } from '@nestjs/testing';
import { PermissionRequestsController } from './permission-requests.controller';

describe('PermissionRequestsController', () => {
  let controller: PermissionRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionRequestsController],
    }).compile();

    controller = module.get<PermissionRequestsController>(PermissionRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
