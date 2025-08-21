import { ProjectStatus } from '../dto/create-project.dto';

export interface ProjectResponseInterface {
  id: number;
  clientId: number;
  country: string;
  servicesNeeded: string[];
  budget: number;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: number;
    companyName: string;
    contactEmail: string;
  };
}

export interface PaginatedProjectsInterface {
  data: ProjectResponseInterface[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
