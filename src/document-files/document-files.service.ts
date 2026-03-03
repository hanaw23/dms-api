import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { DocumentFilesResponseDto } from './dto/document-files-response.dto';
import { UpdateDocumentFilesDto } from './dto/update-document-files.dto';
import { DeleteDocumentFilesDto } from './dto/delete-document-files.dto';

@Injectable()
export class DocumentFilesService {
  constructor(private dbService: PrismaService) {}

  // GET semua file berdasarkan document_id
  async findAll(
    documentId: number,
  ): Promise<ApiResponseDto<DocumentFilesResponseDto[]>> {
    const document = await this.dbService.documents.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new HttpException('Dokumen tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const files = await this.dbService.documentFiles.findMany({
      where: { document_id: documentId },
      orderBy: { created_at: 'asc' },
    });

    const fileDtos = files.map((file) =>
      plainToClass(DocumentFilesResponseDto, file, {
        excludeExtraneousValues: true,
      }),
    );

    return new ApiResponseDto(200, 'Berhasil mengambil file', fileDtos);
  }

  // GET 1 file by id
  async findOne(id: number): Promise<ApiResponseDto<DocumentFilesResponseDto>> {
    const file = await this.dbService.documentFiles.findUnique({
      where: { id },
    });

    if (!file) {
      throw new HttpException('File tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const fileDto = plainToClass(DocumentFilesResponseDto, file, {
      excludeExtraneousValues: true,
    });

    return new ApiResponseDto(200, 'Berhasil mengambil file', fileDto);
  }

  // UPDATE file (ganti file)
  async update(
    id: number,
    updateDto: UpdateDocumentFilesDto,
    file: Express.Multer.File | undefined,
  ): Promise<ApiResponseDto<DocumentFilesResponseDto>> {
    const existingFile = await this.dbService.documentFiles.findUnique({
      where: { id },
    });

    if (!existingFile) {
      throw new HttpException('File tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const updateData: any = {};

    if (updateDto.filename) {
      updateData.filename = updateDto.filename;
    }

    if (file) {
      updateData.url_doc = `http://localhost:3000/uploads/${file.filename}`;
      updateData.filename = file.originalname;
    }

    const updatedFile = await this.dbService.documentFiles.update({
      where: { id },
      data: updateData,
    });

    const fileDto = plainToClass(DocumentFilesResponseDto, updatedFile, {
      excludeExtraneousValues: true,
    });

    return new ApiResponseDto(200, 'File berhasil diupdate', fileDto);
  }

  // DELETE single file by id
  async remove(id: number): Promise<ApiResponseDto<null>> {
    const existingFile = await this.dbService.documentFiles.findUnique({
      where: { id },
    });

    if (!existingFile) {
      throw new HttpException('File tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    await this.dbService.documentFiles.delete({
      where: { id },
    });

    return new ApiResponseDto(200, 'File berhasil dihapus', null);
  }

  // DELETE bulk by ids
  async removeBulk(
    deleteDto: DeleteDocumentFilesDto,
  ): Promise<ApiResponseDto<null>> {
    const existingFiles = await this.dbService.documentFiles.findMany({
      where: { id: { in: deleteDto.ids } },
    });

    if (existingFiles.length !== deleteDto.ids.length) {
      throw new HttpException(
        'Beberapa file tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.dbService.documentFiles.deleteMany({
      where: { id: { in: deleteDto.ids } },
    });

    return new ApiResponseDto(200, 'File berhasil dihapus', null);
  }
}
