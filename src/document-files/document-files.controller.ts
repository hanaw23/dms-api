import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentFilesService } from './document-files.service';
import { UpdateDocumentFilesDto } from './dto/update-document-files.dto';
import { DeleteDocumentFilesDto } from './dto/delete-document-files.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { DocumentFilesResponseDto } from './dto/document-files-response.dto';

@ApiTags('Document Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('document-files')
export class DocumentFilesController {
  constructor(private readonly documentFilesService: DocumentFilesService) {}

  // GET semua file by document_id
  @Get('document/:documentId')
  @ApiOperation({ summary: 'Get semua file berdasarkan document ID' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil file' })
  @ApiResponse({ status: 404, description: 'Dokumen tidak ditemukan' })
  async findAll(
    @Param('documentId', ParseIntPipe) documentId: number,
  ): Promise<ApiResponseDto<DocumentFilesResponseDto[]>> {
    return this.documentFilesService.findAll(documentId);
  }

  // GET 1 file by id
  @Get(':id')
  @ApiOperation({ summary: 'Get file berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil file' })
  @ApiResponse({ status: 404, description: 'File tidak ditemukan' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<DocumentFilesResponseDto>> {
    return this.documentFilesService.findOne(id);
  }

  // UPDATE file by id
  @Patch(':id')
  @ApiOperation({ summary: 'Update file berdasarkan ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File pengganti (opsional)',
        },
        filename: {
          type: 'string',
          description: 'Nama file baru (opsional)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'File berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'File tidak ditemukan' })
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
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDocumentFilesDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponseDto<DocumentFilesResponseDto>> {
    return this.documentFilesService.update(id, updateDto, file);
  }

  // DELETE single file by id
  @Delete(':id')
  @ApiOperation({ summary: 'Hapus file berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'File berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'File tidak ditemukan' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<null>> {
    return this.documentFilesService.remove(id);
  }

  // DELETE bulk
  @Delete('bulk')
  @ApiOperation({ summary: 'Hapus banyak file sekaligus' })
  @ApiBody({ type: DeleteDocumentFilesDto })
  @ApiResponse({ status: 200, description: 'File berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Beberapa file tidak ditemukan' })
  async removeBulk(
    @Body() deleteDto: DeleteDocumentFilesDto,
  ): Promise<ApiResponseDto<null>> {
    return this.documentFilesService.removeBulk(deleteDto);
  }
}
