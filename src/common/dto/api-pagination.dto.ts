import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max, IsString } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: 'Halaman ke berapa (dimulai dari 1)',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Jumlah data per halaman (max 100)',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    example: 'Laporan',
    description: 'Cari dokumen berdasarkan nama (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
