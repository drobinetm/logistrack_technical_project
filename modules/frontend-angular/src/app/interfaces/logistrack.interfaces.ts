// Base interface for map markers
export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  color?: 'red' | 'green' | 'yellow' | 'blue';
  popup?: string;
}

// Base interface for all order types
export interface BaseOrder {
  id: string | number;
  code: string;
  origin?: string;
  destination: string;
  status: string;
  cdPyme: 'CD' | 'Pyme';
  dispatchDate: string | Date;
  date?: string | Date; // For backward compatibility with component
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
export interface Product {
  id: number;
  Name: string;
  Sku: string;
}

export interface PreparationOrder extends BaseOrder {
  volume: number;
  weight: number;
  products: Product[];
  // Add any other preparation-specific properties here
}

export interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  licensePlate: string;
  email?: string;
  phone?: string;
}

export interface ShippingOrder extends BaseOrder {
  driver?: Driver;
  volume: number;
  weight: number;
  numberOfBags?: number;
  bags?: number; // Alias for numberOfBags
  origin?: string;
  latitude?: number;
  longitude?: number;
  products: Product[];
  carrier?: string;
  route?: string;
  estimatedTime?: string;
}

export interface ReceptionOrder extends BaseOrder {
  // Reception specific properties
  driver?: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  incidents?: Array<{
    id: number;
    description: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
    createdAt: string | Date;
    resolvedAt?: string | Date;
    resolutionNotes?: string;
  }>;
  products?: Array<{
    id: number;
    name: string;
    sku: string;
    quantity: number;
    receivedQuantity?: number;
    status?: 'pending' | 'partial' | 'complete' | 'damaged';
  }>;
  notes?: string;
  receivedAt?: string | Date;
  receivedBy?: string;
  condition?: 'good' | 'damaged' | 'partial';
}

export interface ConsolidationGroup {
  id: string | number;
  blockId?: string | number; // For backward compatibility
  blockName?: string; // For backward compatibility
  name?: string; // Alias for blockName
  orders: BaseOrder[];
  status: string;
  driver?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  color?: string;
  capacity?: number;
  weight?: number;
  total?: number;
  completed?: number;
  pending?: number;
  rejected?: number;
  delivered?: number;
  approved?: number;
  inDispatch?: number;
  readyToShip?: number;
  readyToDeliver?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface DistributionOrder extends BaseOrder {
  confirmation: boolean;
  driver?: Driver;
  products?: Array<Product>;
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
  date?: Date | null;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
