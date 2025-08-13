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
  OrderFilters
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class LogisTrackService {
  private readonly baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  //#region Dispatch Orders
  getDispatchOrders(filters?: Partial<OrderFilters>): Observable<ApiResponse<DispatchOrder[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<DispatchOrder[]>>(`${this.baseUrl}/despacho/`, { params });
  }

  getDispatchOrderById(id: string | number): Observable<ApiResponse<DispatchOrder>> {
    return this.http.get<ApiResponse<DispatchOrder>>(`${this.baseUrl}/despacho/${id}/`);
  }
  //#endregion

  //#region Preparation Orders
  getPreparationOrders(filters?: Partial<OrderFilters>): Observable<ApiResponse<PreparationOrder[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<PreparationOrder[]>>(`${this.baseUrl}/preparacion/`, { params });
  }
  //#endregion

  //#region Shipping Orders
  getShippingOrders(filters?: Partial<OrderFilters>): Observable<ApiResponse<ShippingOrder[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<ShippingOrder[]>>(`${this.baseUrl}/envio/`, { params });
  }
  //#endregion

  //#region Reception Orders
  getReceptionOrders(filters?: Partial<OrderFilters>): Observable<ApiResponse<ReceptionOrder[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<ReceptionOrder[]>>(`${this.baseUrl}/recepcion/`, { params });
  }
  //#endregion

  //#region Consolidation
  getConsolidationGroups(filters?: Partial<OrderFilters>): Observable<ApiResponse<ConsolidationGroup[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<ConsolidationGroup[]>>(`${this.baseUrl}/consolidacion/`, { params });
  }
  //#endregion

  //#region Distribution
  getDistributionOrders(filters?: Partial<OrderFilters>): Observable<ApiResponse<DistributionOrder[]>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<ApiResponse<DistributionOrder[]>>(
      `${this.baseUrl}/distribucion/bloques/`,
      { params }
    );
  }
  //#endregion

  //#region Helper Methods
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
  //#endregion
}
