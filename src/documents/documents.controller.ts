import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { PaginationDto } from 'src/common/dto/api-pagination.dto';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Upload Document File
   */
  @Post('upload')
  @ApiOperation({ summary: 'Upload document file from computer' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Pilih file dari komputer',
        },
        name_doc: {
          type: 'string',
          description: 'Nama dokumen (WAJIB DIISI)',
          example: 'Laporan Keuangan Q1',
        },
      },
      required: ['file', 'name_doc'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          callback(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // Max 5MB
      },
    }),
  )
  @ApiResponse({ status: 201, description: 'File berhasil diupload' })
  @ApiResponse({
    status: 400,
    description: 'File atau nama dokumen tidak valid',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateDocumentDto,
    @Request() req,
  ): Promise<ApiResponseDto<DocumentResponseDto>> {
    return this.documentsService.uploadFile(
      file,
      createDto,
      req.user.id,
      req.user.username,
      req.user.role,
    );
  }

  /**
   * Get All Documents dengan Pagination & Search
   */
  @Get()
  @ApiOperation({ summary: 'Get all documents with pagination and search' })
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
    example: 'Laporan',
    description: 'Cari berdasarkan nama dokumen',
  })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<DocumentResponseDto>> {
    return this.documentsService.findAll(paginationDto);
  }

  /**
   * Get My Documents dengan Pagination & Search
   */
  @Get('my-documents')
  @ApiOperation({ summary: 'Get my documents with pagination and search' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'Laporan' })
  @ApiResponse({ status: 200, description: 'Dokumen saya berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyDocuments(
    @Request() req,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<DocumentResponseDto>> {
    return this.documentsService.findByUserId(req.user.id, paginationDto);
  }

  /**
   * Check Update Permission (untuk tampilkan message di FE)
   */
  @Get(':id/check-update-permission')
  @ApiOperation({
    summary: 'Check if user can update document',
    description:
      'Return message untuk FE: bisa langsung update atau perlu request permission',
  })
  @ApiResponse({ status: 200, description: 'Permission check berhasil' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Dokumen tidak ditemukan' })
  async checkUpdatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<ApiResponseDto<{ canUpdate: boolean; message: string }>> {
    return this.documentsService.checkUpdatePermission(
      id,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * Check Remove Permission (untuk tampilkan message di FE)
   */
  @Get(':id/check-remove-permission')
  @ApiOperation({
    summary: 'Check if user can remove document',
    description:
      'Return message untuk FE: bisa langsung remove atau perlu request permission',
  })
  @ApiResponse({ status: 200, description: 'Permission check berhasil' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Dokumen tidak ditemukan' })
  async checkRemovePermission(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<ApiResponseDto<{ canRemove: boolean; message: string }>> {
    return this.documentsService.checkRemovePermission(
      id,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * Get Document by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Dokumen tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<DocumentResponseDto>> {
    return this.documentsService.findOne(id);
  }

  /**
   * Update Document (Nama dan/atau File)
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update document name and/or file',
    description:
      'Admin: langsung update. User: perlu permission. Nama dan file keduanya optional.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File baru (optional)',
        },
        name_doc: {
          type: 'string',
          description: 'Nama dokumen baru (optional)',
          example: 'Laporan Q1 2026 (Updated)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          callback(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // Max 5MB
      },
    }),
  )
  @ApiResponse({
    status: 200,
    description: 'Dokumen berhasil diupdate',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - tidak punya permission',
  })
  @ApiResponse({ status: 404, description: 'Dokumen tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File, // ⬅️ TAMBAH INI
    @Body() updateDto: UpdateDocumentDto,
    @Request() req,
  ): Promise<ApiResponseDto<DocumentResponseDto>> {
    return this.documentsService.update(
      id,
      updateDto,
      file,
      req.user.id,
      req.user.username,
      req.user.role,
    );
  }

  /**
   * Request Permission (User klik button "Request Permission")
   */
  @Patch(':id/request-permission')
  @ApiOperation({
    summary: 'Request permission to replace or remove document',
    description:
      'User request permission dengan mengubah status jadi pending_replace atau pending_remove',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission request berhasil dikirim',
  })
  @ApiResponse({
    status: 400,
    description: 'Status tidak valid atau sudah pending',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Dokumen tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async requestPermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ): Promise<ApiResponseDto<DocumentResponseDto>> {
    return this.documentsService.requestPermission(
      id,
      updateStatusDto,
      req.user.id,
      req.user.username,
    );
  }

  /**
   * Delete Document
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete document',
    description: 'Admin: langsung delete. User: perlu permission',
  })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil dihapus' })
  @ApiResponse({
    status: 400,
    description: 'Tidak bisa hapus dokumen dengan status pending_replace',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - tidak punya permission',
  })
  @ApiResponse({ status: 404, description: 'Dokumen tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<ApiResponseDto<null>> {
    return this.documentsService.remove(id, req.user.id, req.user.role);
  }
}
