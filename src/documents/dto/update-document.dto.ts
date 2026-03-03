import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  name_doc?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @ApiProperty({ required: false, example: [1, 2] })
  deleted_file_ids?: number[];
}
