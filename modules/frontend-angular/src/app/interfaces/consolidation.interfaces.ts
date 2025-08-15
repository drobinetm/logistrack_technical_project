import { BaseOrder, Product as BaseProduct, Driver } from './logistrack.interfaces';

export type CdPymeType = 'CD' | 'Pyme';

export interface Product extends Omit<BaseProduct, 'Name'> {
  name: string;
  sku?: string;
}

export interface Order extends BaseOrder {
  cdPyme: CdPymeType;
  volume: number;
  weight: number;
  user: string;
  products?: Product[];
  driver?: Driver | string;
  deliveryDate?: string | Date;
}

export interface BlockGroup {
  id: string;
  name: string;
  orders: Order[];
  color: string;
  driver?: string;
  capacity: number;
  weight: number;
  status: 'pending' | 'ready' | 'assigned';
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  delivered: number;
  approved: number;
  inDispatch: number;
  readyToShip: number;
  readyToDeliver: number;
}
