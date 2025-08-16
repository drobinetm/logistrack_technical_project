import { BaseOrder } from './logistrack.interfaces';

export interface DashboardOrder extends BaseOrder {
  status: string;
  destination: string;
  code: string;
}

export interface DashboardResponse {
  countBlocks: number;
  orders: DashboardOrder[];
}

export interface KPI {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export interface MapMarker {
  lat: number;
  lng: number;
  title?: string;
  color?: 'red' | 'green' | 'yellow' | 'blue';
  popup?: string;
}
