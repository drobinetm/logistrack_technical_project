import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Order {
  id: string;
  origin: string;
  destination: string;
  date: Date;
  cdPyme: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  driver?: string;
  weight?: number;
  volume?: number;
  bags?: number;
  lat?: number;
  lng?: number;
  incidents?: string[];
  block?: string;
  signature?: boolean;
  photo?: boolean;
}

export interface KPI {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private ordersSubject = new BehaviorSubject<Order[]>(this.generateMockOrders());
  
  orders$ = this.ordersSubject.asObservable();

  private generateMockOrders(): Order[] {
    const origins = ['CD Santiago', 'CD Valparaíso', 'CD Concepción', 'CD Antofagasta'];
    const destinations = ['Pyme A', 'Pyme B', 'Pyme C', 'Pyme D', 'Pyme E'];
    const drivers = ['Juan Pérez', 'Ana García', 'Carlos López', 'María Rodríguez', 'Pedro Martínez'];
    const statuses: Order['status'][] = ['pending', 'in-progress', 'completed', 'error'];
    const blocks = ['A', 'B', 'C', 'D'];

    return Array.from({ length: 50 }, (_, i) => ({
      id: `ORD-${String(i + 1).padStart(3, '0')}`,
      origin: origins[Math.floor(Math.random() * origins.length)],
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      cdPyme: Math.random() > 0.5 ? 'CD' : 'Pyme',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      driver: drivers[Math.floor(Math.random() * drivers.length)],
      weight: Math.round(Math.random() * 1000) + 50,
      volume: Math.round(Math.random() * 100) + 10,
      bags: Math.round(Math.random() * 20) + 1,
      lat: -33.4489 + (Math.random() - 0.5) * 0.1,
      lng: -70.6693 + (Math.random() - 0.5) * 0.1,
      incidents: Math.random() > 0.8 ? ['Retraso en entrega', 'Producto dañado'] : [],
      block: blocks[Math.floor(Math.random() * blocks.length)],
      signature: Math.random() > 0.3,
      photo: Math.random() > 0.4
    }));
  }

  getOrders(): Observable<Order[]> {
    return this.orders$;
  }

  getKPIs(): KPI[] {
    const orders = this.ordersSubject.value;
    return [
      {
        label: 'Órdenes en Despacho',
        value: orders.filter(o => o.status === 'in-progress').length,
        icon: 'send',
        color: '#1976d2'
      },
      {
        label: 'Bloques Listos',
        value: 8,
        icon: 'inventory',
        color: '#388e3c'
      },
      {
        label: 'Entregas Completadas',
        value: orders.filter(o => o.status === 'completed').length,
        icon: 'check_circle',
        color: '#388e3c'
      },
      {
        label: 'Entregas Pendientes',
        value: orders.filter(o => o.status === 'pending').length,
        icon: 'pending',
        color: '#ff9800'
      }
    ];
  }

  getOrdersByStatus(status: string): Order[] {
    return this.ordersSubject.value.filter(order => order.status === status);
  }

  getOrdersByBlock(): { [key: string]: Order[] } {
    const orders = this.ordersSubject.value;
    const grouped: { [key: string]: Order[] } = {};
    
    orders.forEach(order => {
      if (order.block) {
        if (!grouped[order.block]) {
          grouped[order.block] = [];
        }
        grouped[order.block].push(order);
      }
    });
    
    return grouped;
  }
}