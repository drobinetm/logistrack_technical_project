export interface Order {
  id: string;
  code?: string;
  origin: string;
  destination: string;
  cdPyme: string;
  date: Date | null;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  lat?: number | null;
  lng?: number | null;
  dispatchDate?: string;
  latitude?: number;
  longitude?: number;
  _raw?: unknown;
}

export interface OrderFilters {
  search: string;
  cdPyme: string;
  status: string;
  dispatchDate: string;
}
