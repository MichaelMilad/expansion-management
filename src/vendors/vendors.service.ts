import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';
import {
  VendorResponseInterface,
  PaginatedVendorResponse,
} from './interfaces/vendor-response.interface';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createVendorDto: CreateVendorDto,
  ): Promise<VendorResponseInterface> {
    const vendor = await this.prisma.vendor.create({
      data: {
        name: createVendorDto.name,
        countriesSupported: createVendorDto.countriesSupported,
        servicesOffered: createVendorDto.servicesOffered,
        rating: createVendorDto.rating,
        responseSlaHours: createVendorDto.responseSlaHours,
      },
    });

    return this.transformVendor(vendor);
  }

  async findAll(query: QueryVendorDto): Promise<PaginatedVendorResponse> {
    const {
      search,
      country,
      service,
      minRating,
      maxSlaHours,
      page = 1,
      limit = 10,
    } = query;

    // Build basic where clause for database query
    const whereClause: any = {};

    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (minRating) {
      whereClause.rating = {
        gte: minRating,
      };
    }

    if (maxSlaHours) {
      whereClause.responseSlaHours = {
        lte: maxSlaHours,
      };
    }

    // Get all vendors matching basic criteria
    const allVendors = await this.prisma.vendor.findMany({
      where: whereClause,
      orderBy: [
        { rating: 'desc' },
        { responseSlaHours: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Filter by country and service in memory (Prisma JSON limitations)
    let filteredVendors = allVendors;

    if (country || service) {
      filteredVendors = allVendors.filter((vendor) => {
        let matchesCountry = true;
        let matchesService = true;

        if (country) {
          const countries = vendor.countriesSupported as string[];
          matchesCountry = countries.includes(country);
        }

        if (service) {
          const services = vendor.servicesOffered as string[];
          matchesService = services.includes(service);
        }

        return matchesCountry && matchesService;
      });
    }

    // Apply pagination
    const total = filteredVendors.length;
    const skip = (page - 1) * limit;
    const paginatedVendors = filteredVendors.slice(skip, skip + limit);

    return {
      data: paginatedVendors.map((vendor) => this.transformVendor(vendor)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<VendorResponseInterface> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return this.transformVendor(vendor);
  }

  async update(
    id: number,
    updateVendorDto: UpdateVendorDto,
  ): Promise<VendorResponseInterface> {
    // Check if vendor exists
    await this.findOne(id);

    const vendor = await this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
    });

    return this.transformVendor(vendor);
  }

  async remove(id: number): Promise<void> {
    // Check if vendor exists
    await this.findOne(id);

    await this.prisma.vendor.delete({
      where: { id },
    });
  }

  // Business logic method for matching algorithm
  async findVendorsForProject(
    country: string,
    servicesNeeded: string[],
  ): Promise<VendorResponseInterface[]> {
    // Get all vendors and filter in memory due to Prisma JSON limitations
    const allVendors = await this.prisma.vendor.findMany({
      orderBy: [{ rating: 'desc' }, { responseSlaHours: 'asc' }],
    });

    const matchingVendors = allVendors.filter((vendor) => {
      const vendorCountries = vendor.countriesSupported as string[];
      const vendorServices = vendor.servicesOffered as string[];

      // Must support the project country
      const supportsCountry = vendorCountries.includes(country);

      // Must have at least one service overlap
      const hasServiceOverlap = servicesNeeded.some((service) =>
        vendorServices.includes(service),
      );

      return supportsCountry && hasServiceOverlap;
    });

    return matchingVendors.map((vendor) => this.transformVendor(vendor));
  }

  // Helper method to calculate service overlap for matching algorithm
  calculateServiceOverlap(
    vendorServices: string[],
    projectServices: string[],
  ): number {
    const overlap = vendorServices.filter((service) =>
      projectServices.includes(service),
    );
    return overlap.length;
  }

  private transformVendor(vendor: any): VendorResponseInterface {
    return {
      id: vendor.id,
      name: vendor.name,
      countriesSupported: vendor.countriesSupported as string[],
      servicesOffered: vendor.servicesOffered as string[],
      rating: vendor.rating,
      responseSlaHours: vendor.responseSlaHours,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    };
  }
}
