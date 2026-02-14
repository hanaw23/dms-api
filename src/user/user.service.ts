import { Inject, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { RegisterUserRequest, UserResponse } from '../model/user.model';
import { Logger } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}
  // Register User
  async userRegister(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`Registering new user: ${JSON.stringify(request)}`);

    const registerUserRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, request);

    const totalUserWithSameUsername = await this.prismaService.user.count({
      where: { username: registerUserRequest.username },
    });

    if (totalUserWithSameUsername != 0) {
      throw new HttpException('Username already exist', 400);
    }

    registerUserRequest.password = await bcrypt.hash(
      registerUserRequest.password,
      10,
    );

    const user = await this.prismaService.user.create({
      data: registerUserRequest,
    });

    return {
      username: user.username,
      name: user.name,
      role: user.role,
    };
  }
}
