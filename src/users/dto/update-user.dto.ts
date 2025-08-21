import { PartialType, OmitType } from '@nestjs/mapped-types';
import {
  IsString,
  MinLength,
  IsEmail,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '@prisma/client';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.CLIENT })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  clientId?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @ApiProperty({ example: 'newSecurePassword123' })
  newPassword: string;

  @IsString()
  @ApiProperty({ example: 'currentPassword123' })
  currentPassword: string;
}
