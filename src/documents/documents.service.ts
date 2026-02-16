import { DocumentStatus, UserRole } from '@prisma/client';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import {
  PaginatedResponseDto,
  PaginationMeta,
} from 'src/common/dto/paginated-response.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PaginationDto } from 'src/common/dto/api-pagination.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class DocumentsService {
  constructor(private dbService: PrismaService) {}

  /**
   * Upload File dengan Logic Permission berdasarkan Role
   */
  async uploadFile(
    file: Express.Multer.File,
    createDto: CreateDocumentDto,
    userId: number,
    username: string,
    userRole: UserRole,
  ): Promise<ApiResponseDto<DocumentResponseDto>> {
    if (!file) {
      throw new HttpException('File wajib diupload', HttpStatus.BAD_REQUEST);
    }

    if (!createDto.name_doc || createDto.name_doc.trim() === '') {
      throw new HttpException(
        'Nama dokumen wajib diisi',
        HttpStatus.BAD_REQUEST,
      );
    }

    const fileUrl = `http://localhost:3000/uploads/${file.filename}`;

    // Logic Permission berdasarkan Role
    const isAdmin = userRole === UserRole.ADMIN;
    const permissions = {
      is_remove_permission: isAdmin, // Admin: true, User: false
      is_replace_permission: isAdmin, // Admin: true, User: false
    };

    const document = await this.dbService.documents.create({
      data: {
        name_doc: createDto.name_doc,
        url_doc: fileUrl,
        status: DocumentStatus.uploaded,
        is_remove_permission: permissions.is_remove_permission,
        is_replace_permission: permissions.is_replace_permission,
        user_id: userId,
        created_by: username,
        updated_by: username,
      },
      include: {
        user: true,
      },
    });

    const documentDto = plainToClass(DocumentResponseDto, document, {
      excludeExtraneousValues: true,
    });

    return new ApiResponseDto(201, 'Dokumen berhasil diupload', documentDto);
  }

  /**
   * Get All Documents dengan Pagination & Search
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<DocumentResponseDto>> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name_doc = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const total = await this.dbService.documents.count({ where });
    const documents = await this.dbService.documents.findMany({
      where,
      include: { user: true },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    const documentsDto = documents.map((doc) =>
      plainToClass(DocumentResponseDto, doc, {
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
      'Dokumen berhasil diambil',
      documentsDto,
      meta,
    );
  }

  /**
   * Get My Documents dengan Pagination & Search
   */
  async findByUserId(
    userId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<DocumentResponseDto>> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = { user_id: userId };
    if (search) {
      where.name_doc = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const total = await this.dbService.documents.count({ where });
    const documents = await this.dbService.documents.findMany({
      where,
      include: { user: true },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    const documentsDto = documents.map((doc) =>
      plainToClass(DocumentResponseDto, doc, {
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
      'Dokumen saya berhasil diambil',
      documentsDto,
      meta,
    );
  }

  /**
   * Get Document by ID
   */
  async findOne(id: number): Promise<ApiResponseDto<DocumentResponseDto>> {
    const document = await this.dbService.documents.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!document) {
      throw new HttpException('Dokumen tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const documentDto = plainToClass(DocumentResponseDto, document, {
      excludeExtraneousValues: true,
    });

    return new ApiResponseDto(200, 'Dokumen berhasil diambil', documentDto);
  }

  /**
   * Check Permission for Update
   * Return: bisa langsung update (Admin) atau perlu request permission (User)
   */
  async checkUpdatePermission(
    id: number,
    userId: number,
    userRole: UserRole,
  ): Promise<ApiResponseDto<{ canUpdate: boolean; message: string }>> {
    const document = await this.dbService.documents.findUnique({
      where: { id },
    });

    if (!document) {
      throw new HttpException('Dokumen tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    if (document.user_id !== userId) {
      throw new HttpException(
        'Anda tidak berhak mengubah dokumen ini',
        HttpStatus.FORBIDDEN,
      );
    }

    // Admin bisa langsung update
    if (userRole === UserRole.ADMIN) {
      return new ApiResponseDto(200, 'Admin dapat langsung mengubah dokumen', {
        canUpdate: true,
        message: 'Anda dapat langsung mengubah dokumen ini',
      });
    }

    // User: Cek status
    if (document.status !== DocumentStatus.uploaded) {
      return new ApiResponseDto(200, 'Dokumen sedang dalam proses pending', {
        canUpdate: false,
        message: `Dokumen sedang dalam status ${document.status}. Harap tunggu approval dari Admin.`,
      });
    }

    // User: Cek permission
    if (!document.is_replace_permission) {
      return new ApiResponseDto(
        200,
        'Perlu request permission untuk mengubah',
        {
          canUpdate: false,
          message:
            'Anda perlu mengajukan permission ke Admin untuk mengubah dokumen ini. Klik "Request Permission" untuk melanjutkan.',
        },
      );
    }

    // User punya permission dan status uploaded
    return new ApiResponseDto(200, 'Dapat mengubah dokumen', {
      canUpdate: true,
      message: 'Anda dapat mengubah dokumen ini',
    });
  }

  /**
   * Check Permission for Remove
   * Return: bisa langsung remove (Admin) atau perlu request permission (User)
   */
  async checkRemovePermission(
    id: number,
    userId: number,
    userRole: UserRole,
  ): Promise<ApiResponseDto<{ canRemove: boolean; message: string }>> {
    const document = await this.dbService.documents.findUnique({
      where: { id },
    });

    if (!document) {
      throw new HttpException('Dokumen tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    if (document.user_id !== userId) {
      throw new HttpException(
        'Anda tidak berhak menghapus dokumen ini',
        HttpStatus.FORBIDDEN,
      );
    }

    // Admin bisa langsung remove
    if (userRole === UserRole.ADMIN) {
      return new ApiResponseDto(200, 'Admin dapat langsung menghapus dokumen', {
        canRemove: true,
        message: 'Anda dapat langsung menghapus dokumen ini',
      });
    }

    // User: Cek status
    if (document.status === DocumentStatus.pending_remove) {
      return new ApiResponseDto(200, 'Dokumen sedang pending remove', {
        canRemove: false,
        message:
          'Dokumen sedang dalam proses pending remove. Harap tunggu approval dari Admin.',
      });
    }

    // User: Cek permission
    if (!document.is_remove_permission) {
      return new ApiResponseDto(
        200,
        'Perlu request permission untuk menghapus',
        {
          canRemove: false,
          message:
            'Anda perlu mengajukan permission ke Admin untuk menghapus dokumen ini. Klik "Request Permission" untuk melanjutkan.',
        },
      );
    }

    // User punya permission dan status uploaded
    return new ApiResponseDto(200, 'Dapat menghapus dokumen', {
      canRemove: true,
      message: 'Anda dapat menghapus dokumen ini',
    });
  }

  /**
   * Update Document (Nama dan/atau File)
   * Admin: Langsung update
   * User: Harus punya permission & status uploaded
   */
  async update(
    id: number,
    updateDto: UpdateDocumentDto,
    file: Express.Multer.File | undefined,
    userId: number,
    username: string,
    userRole: UserRole,
  ): Promise<ApiResponseDto<DocumentResponseDto>> {
    const existingDoc = await this.dbService.documents.findUnique({
      where: { id },
    });

    if (!existingDoc) {
      throw new HttpException('Dokumen tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    if (existingDoc.user_id !== userId) {
      throw new HttpException(
        'Anda tidak berhak mengubah dokumen ini',
        HttpStatus.FORBIDDEN,
      );
    }

    // ADMIN: Langsung update tanpa cek permission
    if (userRole === UserRole.ADMIN) {
      const updateData: any = { updated_by: username };

      // Update nama kalau diisi
      if (updateDto.name_doc) {
        updateData.name_doc = updateDto.name_doc;
      }

      // Update file kalau ada
      if (file) {
        const fileUrl = `http://localhost:3000/uploads/${file.filename}`;
        updateData.url_doc = fileUrl;

        // Kalau nama tidak diisi, gunakan nama file baru
        if (!updateDto.name_doc) {
          updateData.name_doc = file.originalname;
        }

        // TODO: Hapus file lama dari storage (optional)
        // const fs = require('fs');
        // const oldFilename = existingDoc.url_doc.split('/').pop();
        // fs.unlinkSync(`./uploads/${oldFilename}`);
      }

      const document = await this.dbService.documents.update({
        where: { id },
        data: updateData,
        include: { user: true },
      });

      const documentDto = plainToClass(DocumentResponseDto, document, {
        excludeExtraneousValues: true,
      });

      return new ApiResponseDto(200, 'Dokumen berhasil diupdate', documentDto);
    }

    // USER: Cek status
    if (existingDoc.status === DocumentStatus.pending_replace) {
      throw new HttpException(
        `Tidak bisa mengubah dokumen dengan status ${existingDoc.status}. Silahkan Tunggu approval dari Admin.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // USER: Cek permission
    if (!existingDoc.is_replace_permission) {
      throw new HttpException(
        'Anda tidak memiliki izin untuk mengubah dokumen ini. Silakan request permission ke Admin terlebih dahulu.',
        HttpStatus.FORBIDDEN,
      );
    }

    // USER: Update document
    const updateData: any = { updated_by: username };

    // Update nama kalau diisi
    if (updateDto.name_doc) {
      updateData.name_doc = updateDto.name_doc;
    }

    // Update file kalau ada
    if (file) {
      const fileUrl = `http://localhost:3000/uploads/${file.filename}`;
      updateData.url_doc = fileUrl;

      // Kalau nama tidak diisi, gunakan nama file baru
      if (!updateDto.name_doc) {
        updateData.name_doc = file.originalname;
      }
    }

    const document = await this.dbService.documents.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });

    const documentDto = plainToClass(DocumentResponseDto, document, {
      excludeExtraneousValues: true,
    });

    return new ApiResponseDto(200, 'Dokumen berhasil diupdate', documentDto);
  }

  /**
   * Request Permission (Update Status)
   * User klik button "Request Permission" -> ubah semua status
   */
  async requestPermission(
    id: number,
    updateStatusDto: UpdateStatusDto,
    userId: number,
    username: string,
  ): Promise<ApiResponseDto<DocumentResponseDto>> {
    const existingDoc = await this.dbService.documents.findUnique({
      where: { id },
    });

    if (!existingDoc) {
      throw new HttpException('Dokumen tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    const document = await this.dbService.documents.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        updated_by: username,
      },
      include: { user: true },
    });

    const documentDto = plainToClass(DocumentResponseDto, document, {
      excludeExtraneousValues: true,
    });

    const message =
      updateStatusDto.status === DocumentStatus.pending_replace
        ? 'Permission request untuk replace dokumen telah dikirim ke Admin'
        : 'Permission request untuk remove dokumen telah dikirim ke Admin';

    return new ApiResponseDto(200, message, documentDto);
  }

  /**
   * Delete Document
   * Admin: Langsung delete
   * User: Harus punya permission & status uploaded
   */
  async remove(
    id: number,
    userId: number,
    userRole: UserRole,
  ): Promise<ApiResponseDto<null>> {
    const existingDoc = await this.dbService.documents.findUnique({
      where: { id },
    });

    if (!existingDoc) {
      throw new HttpException('Dokumen tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    if (existingDoc.user_id !== userId) {
      throw new HttpException(
        'Anda tidak berhak menghapus dokumen ini',
        HttpStatus.FORBIDDEN,
      );
    }

    // ADMIN: Langsung hapus tanpa cek permission
    if (userRole === UserRole.ADMIN) {
      await this.dbService.documents.delete({ where: { id } });
      return new ApiResponseDto(200, 'Dokumen berhasil dihapus', null);
    }

    // USER: Cek status
    if (existingDoc.status === DocumentStatus.pending_remove) {
      throw new HttpException(
        'Dokumen sedang dalam proses pending remove. Harap tunggu approval dari Admin.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // USER: Cek permission
    if (!existingDoc.is_remove_permission) {
      throw new HttpException(
        'Anda tidak memiliki izin untuk menghapus dokumen ini. Silakan request permission ke Admin terlebih dahulu.',
        HttpStatus.FORBIDDEN,
      );
    }

    // USER: Delete document
    await this.dbService.documents.delete({ where: { id } });
    return new ApiResponseDto(200, 'Dokumen berhasil dihapus', null);
  }
}
