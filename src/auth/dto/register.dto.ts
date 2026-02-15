import { Prisma, UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';

export class RegisterDto implements Prisma.UsersCreateInput {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john_doe' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'USER', enum: UserRole })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
