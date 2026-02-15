import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateDocumentDto {
  @ApiProperty({
    example: 'Laporan Q1 2026 (Updated)',
    description: 'Nama dokumen baru (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  name_doc?: string;
}
