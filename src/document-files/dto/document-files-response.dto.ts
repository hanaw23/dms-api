import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DocumentFilesResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'http://localhost:3000/uploads/file.pdf' })
  url_doc: string;

  @Expose()
  @ApiProperty({ example: 'laporan.pdf' })
  filename: string;

  @Expose()
  @ApiProperty()
  created_at: Date;

  @Expose()
  @ApiProperty({ example: 1 })
  document_id: number;
}
