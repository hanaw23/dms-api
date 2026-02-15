import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { RequestType } from '@prisma/client';

export class CreatePermissionRequestDto {
  @ApiProperty({
    example: 1,
    description: 'ID dokumen yang diminta permission',
  })
  @IsNotEmpty()
  @IsInt()
  document_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID admin yang akan menerima request',
  })
  @IsNotEmpty()
  @IsInt()
  admin_id: number;

  @ApiProperty({
    example: 'REPLACE',
    enum: RequestType,
    description: 'Tipe request: REPLACE atau REMOVE',
  })
  @IsNotEmpty()
  @IsEnum(RequestType)
  request_type: RequestType;

  @ApiProperty({
    example: 'Saya perlu mengganti file karena ada data yang salah',
    description: 'Pesan optional dari user',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;
}
