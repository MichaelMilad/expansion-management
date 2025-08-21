import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Password must be at least 6 characters long',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.CLIENT,
    example: UserRole.CLIENT,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either CLIENT or ADMIN' })
  role?: UserRole = UserRole.CLIENT;

  @ApiPropertyOptional({
    example: 1,
    description: 'Client ID to link this user to (only for CLIENT role)',
  })
  @IsOptional()
  @IsInt({ message: 'Client ID must be an integer' })
  clientId?: number;

  @ApiPropertyOptional({
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
