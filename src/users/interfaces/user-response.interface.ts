import { UserRole } from '@prisma/client';

export interface UserResponseInterface {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  clientId?: number;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: number;
    companyName: string;
    contactEmail: string;
  };
}
