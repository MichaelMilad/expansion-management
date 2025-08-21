import {
  IsString,
  IsArray,
  IsNumber,
  IsEnum,
  Min,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateProjectDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the client owning this project',
  })
  @IsNumber({}, { message: 'Client ID must be a number' })
  clientId: number;

  @ApiProperty({
    example: 'United States',
    description: 'Target country for expansion',
  })
  @IsString({ message: 'Country must be a string' })
  country: string;

  @ApiProperty({
    example: ['consulting', 'market-research', 'legal-compliance'],
    description: 'List of services needed for this project',
  })
  @IsArray({ message: 'Services needed must be an array' })
  @ArrayNotEmpty({ message: 'At least one service must be specified' })
  @IsString({ each: true, message: 'Each service must be a string' })
  servicesNeeded: string[];

  @ApiProperty({
    example: 100000.5,
    description: 'Project budget in USD',
    minimum: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Budget must be a valid number with max 2 decimal places' },
  )
  @Min(0, { message: 'Budget must be positive' })
  @Transform(({ value }) => parseFloat(value))
  budget: number;

  @ApiPropertyOptional({
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
    description: 'Project status - defaults to ACTIVE',
  })
  @IsEnum(ProjectStatus, { message: 'Status must be a valid project status' })
  @IsOptional()
  status?: ProjectStatus = ProjectStatus.ACTIVE;
}
