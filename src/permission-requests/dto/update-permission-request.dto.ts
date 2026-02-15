import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsString, IsOptional } from 'class-validator';
import { PermissionStatus } from '@prisma/client';

export class UpdatePermissionRequestDto {
  @ApiProperty({
    example: 'APPROVED',
    enum: PermissionStatus,
    description: 'Status permission: APPROVED atau REJECTED',
  })
  @IsNotEmpty()
  @IsEnum(PermissionStatus)
  status_permission: PermissionStatus;

  @ApiProperty({
    example: 'Request approved, silakan replace file',
    description: 'Catatan dari admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  admin_note?: string;
}
