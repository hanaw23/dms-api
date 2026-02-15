import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PermissionRequestsService } from './permission-requests.service';
import { CreatePermissionRequestDto } from './dto/create-permission-request.dto';
import { UpdatePermissionRequestDto } from './dto/update-permission-request.dto';
import { PermissionRequestResponseDto } from './dto/permission-request-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationDto } from 'src/common/dto/api-pagination.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Permission Requests')
@Controller('permission-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PermissionRequestsController {
  constructor(
    private readonly permissionRequestsService: PermissionRequestsService,
  ) {}

  /**
   * Create Permission Request (User request permission ke Admin)
   */
  @Post()
  @ApiOperation({
    summary: 'Create permission request',
    description:
      'User membuat request permission ke Admin untuk replace/remove dokumen',
  })
  @ApiResponse({
    status: 201,
    description: 'Request berhasil dikirim ke Admin',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validasi gagal' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - bukan pemilik dokumen',
  })
  @ApiResponse({
    status: 404,
    description: 'Dokumen atau Admin tidak ditemukan',
  })
  async create(
    @Body() createDto: CreatePermissionRequestDto,
    @Request() req,
  ): Promise<ApiResponseDto<any>> {
    // Validasi: Hanya user biasa yang bisa request
    if (req.user.role === UserRole.ADMIN) {
      throw new HttpException(
        'Admin tidak perlu membuat permission request',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.permissionRequestsService.create(createDto, req.user.id);
  }

  /**
   * Get All Permission Requests (Admin only)
   */
  @Get()
  @ApiOperation({
    summary: 'Get all permission requests (Admin only)',
    description: 'Admin melihat semua permission request yang masuk',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'Laporan',
    description: 'Search by document name atau username',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission requests berhasil diambil',
    type: PermissionRequestResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - bukan admin' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Request() req,
  ): Promise<PaginatedResponseDto<PermissionRequestResponseDto>> {
    // Validasi: Hanya admin yang bisa lihat semua requests
    if (req.user.role !== UserRole.ADMIN) {
      throw new HttpException(
        'Hanya Admin yang bisa melihat semua permission requests. Gunakan /my-requests untuk melihat request Anda.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.permissionRequestsService.findAll(paginationDto, req.user.id);
  }

  /**
   * Get My Permission Requests (User melihat request yang dia buat)
   */
  @Get('my-requests')
  @ApiOperation({
    summary: 'Get my permission requests',
    description: 'User melihat semua request permission yang dia buat',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'My requests berhasil diambil',
    type: PermissionRequestResponseDto,
  })
  async findMyRequests(
    @Query() paginationDto: PaginationDto,
    @Request() req,
  ): Promise<PaginatedResponseDto<PermissionRequestResponseDto>> {
    return this.permissionRequestsService.findMyRequests(
      req.user.id,
      paginationDto,
    );
  }

  /**
   * Get Permission Request by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get permission request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission request berhasil diambil',
    type: PermissionRequestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission request tidak ditemukan',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<PermissionRequestResponseDto>> {
    return this.permissionRequestsService.findOne(id);
  }

  /**
   * Update Permission Request (Admin approve/reject)
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Approve or reject permission request (Admin only)',
    description:
      'Admin approve atau reject request permission dari user. Status dokumen akan otomatis diupdate.',
  })
  @ApiResponse({
    status: 200,
    description: 'Request berhasil di-review dan dokumen diupdate',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - request sudah di-review',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - bukan admin yang ditunjuk',
  })
  @ApiResponse({
    status: 404,
    description: 'Permission request tidak ditemukan',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePermissionRequestDto,
    @Request() req,
  ): Promise<ApiResponseDto<any>> {
    // Validasi: Hanya admin yang bisa approve/reject
    if (req.user.role !== UserRole.ADMIN) {
      throw new HttpException(
        'Hanya Admin yang bisa mereview permission request',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.permissionRequestsService.update(
      id,
      updateDto,
      req.user.id,
      req.user.username,
    );
  }
}
