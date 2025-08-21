import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    schema: {
      example: {
        id: 1,
        clientId: 1,
        country: 'United States',
        servicesNeeded: ['consulting', 'market-research'],
        budget: 100000.5,
        status: 'ACTIVE',
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
        client: {
          id: 1,
          companyName: 'Tech Corp',
          contactEmail: 'contact@techcorp.com',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.projectsService.create(createProjectDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with pagination and filtering' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by project status',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Filter by country',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by client ID (Admin only)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
            clientId: 1,
            country: 'United States',
            servicesNeeded: ['consulting', 'market-research'],
            budget: 100000.5,
            status: 'ACTIVE',
            createdAt: '2025-01-15T10:30:00Z',
            updatedAt: '2025-01-15T10:30:00Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrevious: false,
        },
      },
    },
  })
  async findAll(
    @Query() query: ProjectQueryDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.projectsService.findAll(query, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Project found' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - access denied' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.projectsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.projectsService.update(id, updateProjectDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancel a project (soft delete)',
    description: 'Sets project status to CANCELLED instead of hard deletion',
  })
  @ApiResponse({ status: 204, description: 'Project cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: any,
  ) {
    await this.projectsService.remove(id, currentUser);
  }

  // Admin-only endpoint for hard deletion
  @Delete(':id/hard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Hard delete a project (Admin only)',
    description: 'Permanently removes the project from database',
  })
  @ApiResponse({ status: 204, description: 'Project deleted permanently' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Admin role required' })
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    throw new Error('Hard delete not implemented - use soft delete instead');
  }
}
