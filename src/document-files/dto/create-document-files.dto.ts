import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentFilesDto {
  @ApiProperty({ example: 1, description: 'ID dokumen yang dituju' })
  @IsNotEmpty()
  @IsNumber()
  document_id: number;
}
