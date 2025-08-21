import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import {
  ProjectResponseInterface,
  PaginatedProjectsInterface,
} from './interfaces/project-response.interface';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProjectDto: CreateProjectDto,
    currentUser: any,
  ): Promise<ProjectResponseInterface> {
    const client = await this.prisma.client.findUnique({
      where: { id: createProjectDto.clientId },
    });

    if (!client) {
      throw new BadRequestException('Client not found');
    }

    if (currentUser.role === UserRole.CLIENT) {
      if (
        !currentUser.clientId ||
        currentUser.clientId !== createProjectDto.clientId
      ) {
        throw new ForbiddenException(
          'You can only create projects for your own client',
        );
      }
    }

    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        servicesNeeded: JSON.stringify(createProjectDto.servicesNeeded),
      },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactEmail: true,
          },
        },
      },
    });

    return this.transformProject(project);
  }

  async findAll(
    query: ProjectQueryDto,
    currentUser: any,
  ): Promise<PaginatedProjectsInterface> {
    const { page = 1, limit = 10, status, country, clientId } = query;
    const skip = (page - 1) * limit;

    // Build where clause based on user role and filters
    let whereClause: any = {};

    // Role-based filtering
    if (currentUser.role === UserRole.CLIENT && currentUser.clientId) {
      whereClause.clientId = currentUser.clientId;
    }

    // Apply additional filters
    if (status) whereClause.status = status;
    if (country)
      whereClause.country = { contains: country, mode: 'insensitive' };
    if (clientId) {
      // Admin can filter by any clientId, CLIENT users already restricted above
      if (currentUser.role === UserRole.ADMIN) {
        whereClause.clientId = clientId;
      }
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactEmail: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where: whereClause }),
    ]);

    const transformedProjects = projects.map((project) =>
      this.transformProject(project),
    );
    const totalPages = Math.ceil(total / limit);

    return {
      data: transformedProjects,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(
    id: number,
    currentUser: any,
  ): Promise<ProjectResponseInterface> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactEmail: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Authorization check: CLIENT users can only view their own client's projects
    if (currentUser.role === UserRole.CLIENT) {
      if (!currentUser.clientId || currentUser.clientId !== project.clientId) {
        throw new ForbiddenException(
          'You can only view projects for your own client',
        );
      }
    }

    return this.transformProject(project);
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    currentUser: any,
  ): Promise<ProjectResponseInterface> {
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    // Authorization check: CLIENT users can only update their own client's projects
    if (currentUser.role === UserRole.CLIENT) {
      if (
        !currentUser.clientId ||
        currentUser.clientId !== existingProject.clientId
      ) {
        throw new ForbiddenException(
          'You can only update projects for your own client',
        );
      }
    }

    const updateData: any = { ...updateProjectDto };
    if (updateProjectDto.servicesNeeded) {
      updateData.servicesNeeded = JSON.stringify(
        updateProjectDto.servicesNeeded,
      );
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactEmail: true,
          },
        },
      },
    });

    return this.transformProject(updatedProject);
  }

  async remove(id: number, currentUser: any): Promise<void> {
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    // Authorization check: CLIENT users can only delete their own client's projects
    if (currentUser.role === UserRole.CLIENT) {
      if (
        !currentUser.clientId ||
        currentUser.clientId !== existingProject.clientId
      ) {
        throw new ForbiddenException(
          'You can only delete projects for your own client',
        );
      }
    }

    // Soft delete by updating status to CANCELLED
    await this.prisma.project.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  private transformProject(project: any): ProjectResponseInterface {
    return {
      ...project,
      servicesNeeded: JSON.parse(project.servicesNeeded),
      client: project.client || undefined,
    };
  }
}
