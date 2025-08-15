import { ShippingOrder } from './logistrack.interfaces';

export interface CarrierGroup {
  name: string;
  driverName: string;
  licensePlate: string;
  orders: ShippingOrder[];
  totalOrders: number;
  totalBags: number;
  vehicle: string;
  volume: string;
  weight: string;
}
