import { IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteDocumentFilesDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array ID file yang akan dihapus',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  ids: number[];
}
