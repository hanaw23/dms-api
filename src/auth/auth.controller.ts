import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TransformPasswordPipe } from './transform-password.pipe';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { UserResponseDto, UserAdminResponseDto } from './dto/user.dto';
import { RegisterDto } from './dto/register.dto';
import { PaginationDto } from 'src/common/dto/api-pagination.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(ValidationPipe, TransformPasswordPipe)
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'User already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Get detail User with JWT token
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile (requires JWT token)' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async profile(@Request() req): Promise<ApiResponseDto<UserResponseDto>> {
    console.log('req.user:', req.user); // Debug log

    if (!req.user || !req.user.sub) {
      throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
    }

    return this.authService.getProfile(req.user.sub);
  }

  @Get('admins')
  @ApiOperation({ summary: 'Get all admins with pagination and search' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Halaman ke-',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Jumlah data per halaman',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'Admin 1',
    description: 'Cari berdasarkan nama admin',
  })
  @ApiResponse({ status: 200, description: 'Admin berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserAdminResponseDto>> {
    return this.authService.findAll(paginationDto);
  }
}
