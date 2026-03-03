import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentFilesDto {
  @ApiProperty({ example: 'laporan_baru.pdf', required: false })
  @IsOptional()
  @IsString()
  filename?: string;
}
