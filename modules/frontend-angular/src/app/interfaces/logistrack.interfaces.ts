// Base interface for all order types
export interface BaseOrder {
  id: string | number;
  code: string;
  origin: string;
  destination: string;
  status: string;
  cdPyme: 'CD' | 'Pyme';
  dispatchDate: string | Date;
  latitude?: number;
  longitude?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Dispatch Order specific interface
export interface DispatchOrder extends BaseOrder {
  // Add any dispatch-specific properties here
}

// Other order type interfaces for future use
export interface PreparationOrder extends BaseOrder {
  // Preparation specific properties
}

export interface ShippingOrder extends BaseOrder {
  // Shipping specific properties
}

export interface ReceptionOrder extends BaseOrder {
  // Reception specific properties
}

export interface ConsolidationGroup {
  id: string | number;
  name: string;
  orders: BaseOrder[];
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DistributionOrder extends BaseOrder {
  // Distribution specific properties
  blockId?: string;
  driverName?: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Filter interfaces
export interface OrderFilters {
  search?: string;
  cdPyme?: 'CD' | 'Pyme' | '';
  status?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  dispatchDate?: Date | null;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
