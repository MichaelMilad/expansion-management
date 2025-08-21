export interface VendorResponseInterface {
  id: number;
  name: string;
  countriesSupported: string[];
  servicesOffered: string[];
  rating: number;
  responseSlaHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedVendorResponse {
  data: VendorResponseInterface[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
