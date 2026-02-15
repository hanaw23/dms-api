import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { omit } from 'lodash';
import { compare } from 'bcrypt';
import { JwtConfig } from 'src/jwt.config';
import { plainToClass } from 'class-transformer';
import { UserResponseDto } from './dto/user.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dbService: PrismaService,
  ) {}

  /**
   * Register Service
   * @param dto
   * @returns
   */
  async register(dto: RegisterDto) {
    const user = await this.dbService.users.findFirst({
      where: {
        username: dto.username,
      },
    });

    if (user) {
      throw new HttpException('User Exists', HttpStatus.BAD_REQUEST);
    }

    const createUser = await this.dbService.users.create({
      data: dto,
    });

    if (createUser) {
      return new ApiResponseDto(201, 'Register success', null);
    }

    throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
  }

  /**
   * Login Service
   * @param dto
   * @returns
   */
  async login(dto: LoginDto) {
    const user = await this.dbService.users.findFirst({
      where: { username: dto.username },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const checkPassword = await compare(dto.password, user.password);

    if (!checkPassword) {
      throw new HttpException('Credential Incorrect', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      {
        expiresIn: JwtConfig.user_expired,
        secret: JwtConfig.user_secret,
      },
    );

    const userData = omit(user, ['password', 'created_at', 'updated_at']);

    return new ApiResponseDto(200, 'Login success', {
      accessToken,
      user: userData,
    });
  }

  /**
   * Get User Profile
   * @param userId
   * @returns
   */
  async getProfile(userId: number): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.dbService.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const userDto = plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return new ApiResponseDto(200, 'Profile retrieved successfully', userDto);
  }

  /**
   * Generate JWT (jika masih diperlukan untuk keperluan lain)
   * @param userId
   * @param email
   * @param user
   * @param secret
   * @param expired
   * @returns
   */
  generateJwt(
    userId: any,
    email: string,
    user: any,
    secret: any,
    expired = JwtConfig.user_expired,
  ) {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      {
        expiresIn: expired,
        secret,
      },
    );

    return new ApiResponseDto(200, 'Token generated', {
      accessToken,
      user: omit(user, ['password', 'created_at', 'updated_at']),
    });
  }
}
