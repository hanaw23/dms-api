import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import {
  PaginatedResponseDto,
  PaginationMeta,
} from 'src/common/dto/paginated-response.dto';
import { CreatePermissionRequestDto } from './dto/create-permission-request.dto';
import { UpdatePermissionRequestDto } from './dto/update-permission-request.dto';
import { PermissionRequestResponseDto } from './dto/permission-request-response.dto';
import { PaginationDto } from 'src/common/dto/api-pagination.dto';
import { plainToClass } from 'class-transformer';
import {
  PermissionStatus,
  RequestType,
  DocumentStatus,
  UserRole,
} from '@prisma/client';

@Injectable()
export class PermissionRequestsService {
  constructor(private dbService: PrismaService) {}

  /**
   * Create Permission Request (User request permission ke Admin)
   */
  async create(
    createDto: CreatePermissionRequestDto,
    userId: number,
  ): Promise<ApiResponseDto<any>> {
    // Validasi: Document harus ada
    const document = await this.dbService.documents.findUnique({
      where: { id: createDto.document_id },
    });

    if (!document) {
      throw new HttpException('Dokumen tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    // Validasi: User harus pemilik document
    if (document.user_id !== userId) {
      throw new HttpException(
        'Anda tidak berhak membuat request untuk dokumen ini',
        HttpStatus.FORBIDDEN,
      );
    }

    // Validasi: Document status harus pending
    const expectedStatus =
      createDto.request_type === RequestType.REPLACE
        ? DocumentStatus.pending_replace
        : DocumentStatus.pending_remove;

    if (document.status !== expectedStatus) {
      throw new HttpException(
        `Status dokumen harus ${expectedStatus} untuk membuat request ini`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validasi: Admin harus ada dan role-nya admin
    const admin = await this.dbService.users.findUnique({
      where: { id: createDto.admin_id },
    });

    if (!admin) {
      throw new HttpException('Admin tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    if (admin.role !== UserRole.ADMIN) {
      throw new HttpException(
        'User yang dipilih bukan admin',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validasi: Cek apakah sudah ada request yang ONREVIEW untuk document ini
    const existingRequest = await this.dbService.permissionRequests.findFirst({
      where: {
        document_id: createDto.document_id,
        status_permission: PermissionStatus.ONREVIEW,
      },
    });

    if (existingRequest) {
      throw new HttpException(
        'Sudah ada request yang sedang dalam review untuk dokumen ini',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Buat Permission Request
    const permissionRequest = await this.dbService.permissionRequests.create({
      data: {
        document_id: createDto.document_id,
        user_id: userId,
        admin_id: createDto.admin_id,
        request_type: createDto.request_type,
        message: createDto.message,
        status_permission: PermissionStatus.ONREVIEW,
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return new ApiResponseDto(
      201,
      `Request permission has been sent to ${permissionRequest.admin.name}`,
      {
        request_id: permissionRequest.id,
        admin: permissionRequest.admin,
        request_type: permissionRequest.request_type,
        status: permissionRequest.status_permission,
      },
    );
  }

  /**
   * Get All Permission Requests (Admin only)
   */
  async findAll(
    paginationDto: PaginationDto,
    adminId?: number,
  ): Promise<PaginatedResponseDto<PermissionRequestResponseDto>> {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;
    const search = paginationDto.search;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter by admin_id jika ada
    if (adminId) {
      where.admin_id = adminId;
    }

    // Search by document name atau username
    if (search && search.trim() !== '') {
      where.OR = [
        {
          document: {
            name_doc: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            username: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const total = await this.dbService.permissionRequests.count({ where });

    const requests = await this.dbService.permissionRequests.findMany({
      where,
      include: {
        document: {
          select: {
            id: true,
            name_doc: true,
            url_doc: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    // Transform pakai plainToClass
    const requestsDto = requests.map((req) =>
      plainToClass(PermissionRequestResponseDto, req, {
        excludeExtraneousValues: true,
      }),
    );

    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return new PaginatedResponseDto(
      200,
      'Permission requests berhasil diambil',
      requestsDto,
      meta,
    );
  }

  /**
   * Get Permission Request by ID
   */
  async findOne(
    id: number,
  ): Promise<ApiResponseDto<PermissionRequestResponseDto>> {
    const request = await this.dbService.permissionRequests.findUnique({
      where: { id },
      include: {
        document: {
          select: {
            id: true,
            name_doc: true,
            url_doc: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!request) {
      throw new HttpException(
        'Permission request tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }

    // Transform pakai plainToClass
    const requestDto = plainToClass(PermissionRequestResponseDto, request, {
      excludeExtraneousValues: true,
    });

    return new ApiResponseDto(
      200,
      'Permission request berhasil diambil',
      requestDto,
    );
  }

  /**
   * Update Permission Request (Admin approve/reject)
   */
  async update(
    id: number,
    updateDto: UpdatePermissionRequestDto,
    adminId: number,
    adminUsername: string,
  ): Promise<ApiResponseDto<any>> {
    // Cek request exist
    const existingRequest = await this.dbService.permissionRequests.findUnique({
      where: { id },
      include: {
        document: true,
      },
    });

    if (!existingRequest) {
      throw new HttpException(
        'Permission request tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }

    // Validasi: Admin harus yang ditunjuk untuk request ini
    if (existingRequest.admin_id !== adminId) {
      throw new HttpException(
        'Anda tidak berhak mereview request ini',
        HttpStatus.FORBIDDEN,
      );
    }

    // Validasi: Status harus ONREVIEW
    if (existingRequest.status_permission !== PermissionStatus.ONREVIEW) {
      throw new HttpException(
        `Request sudah di-review dengan status: ${existingRequest.status_permission}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validasi: Status hanya bisa APPROVED atau REJECTED
    if (
      updateDto.status_permission !== PermissionStatus.APPROVED &&
      updateDto.status_permission !== PermissionStatus.REJECTED
    ) {
      throw new HttpException(
        'Status permission hanya bisa APPROVED atau REJECTED',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tentukan status document baru berdasarkan decision
    let newDocumentStatus: DocumentStatus;

    if (updateDto.status_permission === PermissionStatus.APPROVED) {
      // APPROVED
      newDocumentStatus =
        existingRequest.request_type === RequestType.REPLACE
          ? DocumentStatus.approved_replace
          : DocumentStatus.approved_remove;
    } else {
      // REJECTED
      newDocumentStatus =
        existingRequest.request_type === RequestType.REPLACE
          ? DocumentStatus.rejected_replace
          : DocumentStatus.rejected_remove;
    }

    // Update Permission Request & Document dalam transaction
    const result = await this.dbService.$transaction(async (prisma) => {
      // Update Permission Request
      const updatedRequest = await prisma.permissionRequests.update({
        where: { id },
        data: {
          status_permission: updateDto.status_permission,
          admin_note: updateDto.admin_note,
          reviewed_at: new Date(),
        },
        include: {
          document: {
            select: {
              id: true,
              name_doc: true,
              url_doc: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          admin: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      // Update Document Status
      const updatedDocument = await prisma.documents.update({
        where: { id: existingRequest.document_id },
        data: {
          status: newDocumentStatus,
          updated_by: adminUsername,

          // Kalau APPROVED, set permission jadi true
          ...(updateDto.status_permission === PermissionStatus.APPROVED && {
            is_replace_permission:
              existingRequest.request_type === RequestType.REPLACE
                ? true
                : existingRequest.document.is_replace_permission,
            is_remove_permission:
              existingRequest.request_type === RequestType.REMOVE
                ? true
                : existingRequest.document.is_remove_permission,
          }),
        },
      });

      return { updatedRequest, updatedDocument };
    });

    // Transform pakai plainToClass
    const requestDto = plainToClass(
      PermissionRequestResponseDto,
      result.updatedRequest,
      {
        excludeExtraneousValues: true,
      },
    );

    const message =
      updateDto.status_permission === PermissionStatus.APPROVED
        ? `Request berhasil di-approve. User ${result.updatedRequest.user.name} sekarang bisa ${existingRequest.request_type === RequestType.REPLACE ? 'replace' : 'remove'} dokumen.`
        : `Request ditolak. Dokumen tetap dengan status ${newDocumentStatus}.`;

    return new ApiResponseDto(200, message, {
      request: requestDto,
      document_new_status: result.updatedDocument.status,
    });
  }

  /**
   * Get My Permission Requests (User melihat request yang dia buat)
   */
  async findMyRequests(
    userId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<PermissionRequestResponseDto>> {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;

    const skip = (page - 1) * limit;

    const where: any = { user_id: userId };

    const total = await this.dbService.permissionRequests.count({ where });

    const requests = await this.dbService.permissionRequests.findMany({
      where,
      include: {
        document: {
          select: {
            id: true,
            name_doc: true,
            url_doc: true,
            status: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    // Transform pakai plainToClass
    const requestsDto = requests.map((req) =>
      plainToClass(PermissionRequestResponseDto, req, {
        excludeExtraneousValues: true,
      }),
    );

    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return new PaginatedResponseDto(
      200,
      'Request permission saya berhasil diambil',
      requestsDto,
      meta,
    );
  }
}
