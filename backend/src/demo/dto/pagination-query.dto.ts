import { IsNumberString, IsOptional, IsIn, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Offset for pagination (number of items to skip)',
    example: 0,
    required: false,
    type: 'number'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'offset must be a valid number' })
  @Min(0, { message: 'offset must be at least 0' })
  offset?: number = 0;

  @ApiProperty({
    description: 'Limit for pagination (number of items to return, max 100)',
    example: 10,
    required: false,
    type: 'number'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'limit must be a valid number' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit cannot exceed 100' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort order (asc or desc)',
    example: 'asc',
    required: false,
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sort must be either asc or desc' })
  sort?: 'asc' | 'desc' = 'asc';
}