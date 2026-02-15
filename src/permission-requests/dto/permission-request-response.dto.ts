import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PermissionStatus, RequestType, DocumentStatus } from '@prisma/client';

export class UserInPermissionDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'john_doe' })
  @Expose()
  username: string;
}

export class DocumentInPermissionDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Laporan Q1 2026.pdf' })
  @Expose()
  name_doc: string;

  @ApiProperty({ example: 'http://localhost:3000/uploads/file.pdf' })
  @Expose()
  url_doc: string;

  @ApiProperty({ example: 'pending_replace', enum: DocumentStatus })
  @Expose()
  status: DocumentStatus;
}

export class PermissionRequestResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 1 })
  @Expose()
  document_id: number;

  @ApiProperty({ type: DocumentInPermissionDto })
  @Expose()
  @Type(() => DocumentInPermissionDto)
  document: DocumentInPermissionDto;

  @ApiProperty({ example: 1 })
  @Expose()
  user_id: number;

  @ApiProperty({ type: UserInPermissionDto })
  @Expose()
  @Type(() => UserInPermissionDto)
  user: UserInPermissionDto;

  @ApiProperty({ example: 1 })
  @Expose()
  admin_id: number;

  @ApiProperty({ type: UserInPermissionDto })
  @Expose()
  @Type(() => UserInPermissionDto)
  admin: UserInPermissionDto;

  @ApiProperty({ example: 'REPLACE', enum: RequestType })
  @Expose()
  request_type: RequestType;

  @ApiProperty({ example: 'ONREVIEW', enum: PermissionStatus })
  @Expose()
  status_permission: PermissionStatus;

  @ApiProperty({ example: 'Saya perlu replace file', nullable: true })
  @Expose()
  message: string | null;

  @ApiProperty({ example: 'Request approved', nullable: true })
  @Expose()
  admin_note: string | null;

  @ApiProperty({ example: '2026-02-15T10:00:00.000Z' })
  @Expose()
  created_at: Date;

  @ApiProperty({ example: '2026-02-15T11:00:00.000Z' })
  @Expose()
  updated_at: Date;

  @ApiProperty({ example: '2026-02-15T11:00:00.000Z', nullable: true })
  @Expose()
  reviewed_at: Date | null;
}
