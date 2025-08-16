import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse, KPI, MapMarker } from '../interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  private http = inject(HttpClient);

  /**
   * Fetches dashboard data from the API
   */
  public getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard/`);
  }

  /**
   * Transforms dashboard data into KPI metrics
   */
  public getKPIs(orders: any[]): KPI[] {
    const totalOrders = orders.length;
    const inDispatch = orders.filter(o => o.status === 'IN_DISPATCH').length;
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    const pending = orders.filter(o => ['PENDING'].includes(o.status)).length;

    return [
      {
        label: 'Total Pedidos',
        value: totalOrders,
        icon: 'shopping_cart',
        color: '#3f51b5',
      },
      {
        label: 'En Despacho',
        value: inDispatch,
        icon: 'local_shipping',
        color: '#ff9800',
      },
      {
        label: 'Completados',
        value: completed,
        icon: 'check_circle',
        color: '#4caf50',
      },
      {
        label: 'Pendientes',
        value: pending,
        icon: 'pending',
        color: '#f44336',
      },
    ];
  }

  /**
   * Converts orders to map markers
   */
  public getMapMarkers(orders: any[]): MapMarker[] {
    return orders.map(order => ({
      lat: parseFloat(order.latitude),
      lng: parseFloat(order.longitude),
      title: order.destination,
      color: this.getMarkerColor(order.status),
      popup: `
        <strong>${order.code}</strong><br>
        Destino: ${order.destination}<br>
        Estado: ${this.getStatusLabel(order.status)}
      `,
    }));
  }

  private getMarkerColor(status: string): 'red' | 'green' | 'yellow' | 'blue' {
    switch (status) {
      case 'IN_DISPATCH':
        return 'yellow';
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
        return 'blue';
      default:
        return 'red';
    }
  }

  private getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'IN_DISPATCH': 'En Despacho',
      'COMPLETED': 'Completado',
      'PENDING': 'Pendiente',
    };
    return statusMap[status] || status;
  }
}
