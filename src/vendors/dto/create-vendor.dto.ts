import {
  IsString,
  IsArray,
  IsNumber,
  Min,
  Max,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateVendorDto {
  @ApiProperty({
    example: 'TechSolutions Inc',
    description: 'Vendor company name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: ['US', 'CA', 'UK'],
    description: 'Countries where vendor operates',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  countriesSupported: string[];

  @ApiProperty({
    example: ['consulting', 'development', 'marketing'],
    description: 'Services offered by vendor',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  servicesOffered: string[];

  @ApiProperty({
    example: 4.5,
    description: 'Vendor rating (1-5 scale)',
    minimum: 1,
    maximum: 5,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 24,
    description: 'Response SLA in hours',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  responseSlaHours: number;
}
