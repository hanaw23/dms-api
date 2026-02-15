import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPrevPage: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;

  constructor(
    statusCode: number,
    message: string,
    data: T[],
    meta: PaginationMeta,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}
