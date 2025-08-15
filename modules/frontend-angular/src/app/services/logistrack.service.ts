import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  DispatchOrder,
  PreparationOrder,
  ShippingOrder,
  ReceptionOrder,
  ConsolidationGroup,
  DistributionOrder,
  OrderFilters,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class LogisTrackService {
  private readonly baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Get dispatch orders with optional filters
  public getDispatchOrders(
    filters?: Partial<OrderFilters>
  ): Observable<ApiResponse<DispatchOrder[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<DispatchOrder[]>>(`${this.baseUrl}/despacho/`, { params });
  }

  // Get preparation orders with optional filters
  public getPreparationOrders(
    filters?: Partial<OrderFilters>
  ): Observable<ApiResponse<PreparationOrder[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<PreparationOrder[]>>(`${this.baseUrl}/preparacion/`, {
      params,
    });
  }

  // Get shipping orders with optional filters
  public getShippingOrders(
    filters?: Partial<OrderFilters>
  ): Observable<ApiResponse<ShippingOrder[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<ShippingOrder[]>>(`${this.baseUrl}/envio/`, { params });
  }

  // Get reception orders with optional filters
  public getReceptionOrders(
    filters?: Partial<OrderFilters>
  ): Observable<ApiResponse<ReceptionOrder[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<ReceptionOrder[]>>(`${this.baseUrl}/recepcion/`, { params });
  }

  // Get consolidation orders with optional filters
  public getConsolidationGroups(
    filters?: Partial<OrderFilters>
  ): Observable<ApiResponse<ConsolidationGroup[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<ConsolidationGroup[]>>(`${this.baseUrl}/consolidacion/`, {
      params,
    });
  }

  // Get distribution orders with optional filters
  public getDistributionOrders(
    filters?: Partial<OrderFilters>
  ): Observable<ApiResponse<DistributionOrder[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<DistributionOrder[]>>(`${this.baseUrl}/distribucion/`, {
      params,
    });
  }

  // Helper Methods
  private buildQueryParams(filters: Partial<OrderFilters> = {}): HttpParams {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (value instanceof Date) {
          params = params.set(key, value.toISOString().split('T')[0]);
        } else {
          params = params.set(key, String(value));
        }
      }
    });

    return params;
  }
}
