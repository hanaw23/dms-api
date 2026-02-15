import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class UserInDocumentDto {
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

export class DocumentResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Laporan Q1 2026.pdf' })
  @Expose()
  name_doc: string;

  @ApiProperty({
    example: 'http://localhost:3000/uploads/1739620000-laporan.pdf',
  })
  @Expose()
  url_doc: string;

  @ApiProperty({ example: 'uploaded', enum: DocumentStatus })
  @Expose()
  status: DocumentStatus;

  @ApiProperty({ example: false })
  @Expose()
  is_remove_permission: boolean;

  @ApiProperty({ example: false })
  @Expose()
  is_replace_permission: boolean;

  @ApiProperty({ example: 1 })
  @Expose()
  user_id: number;

  @ApiProperty({ type: UserInDocumentDto })
  @Expose()
  @Type(() => UserInDocumentDto)
  user: UserInDocumentDto;

  @ApiProperty({ example: '2026-02-15T09:00:00.000Z' })
  @Expose()
  created_at: Date;

  @ApiProperty({ example: '2026-02-15T10:00:00.000Z' })
  @Expose()
  updated_at: Date;

  @ApiProperty({ example: 'john_doe' })
  @Expose()
  created_by: string;

  @ApiProperty({ example: 'jane_doe', nullable: true })
  @Expose()
  updated_by: string | null;
}
