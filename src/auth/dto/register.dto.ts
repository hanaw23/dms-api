import { Prisma, UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterDto implements Prisma.usersCreateInput {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
