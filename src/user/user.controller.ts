import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponse, RegisterUserRequest } from '../model/user.model';
import { WebResponse } from '../model/web.model';

@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async userRegister(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.userRegister(request);
    return {
      data: result,
    };
  }
}
