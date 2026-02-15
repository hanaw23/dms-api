import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    example: 'pending_replace',
    enum: DocumentStatus,
    description: 'Status baru dokumen',
  })
  @IsNotEmpty()
  @IsEnum(DocumentStatus)
  status: DocumentStatus;
}
