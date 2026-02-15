import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    example: 'Laporan Q1 2026',
    description: 'Nama dokumen (wajib diisi)',
    required: true,
  })
  @IsNotEmpty({ message: 'Nama dokumen wajib diisi' })
  @IsString()
  name_doc: string;
}
