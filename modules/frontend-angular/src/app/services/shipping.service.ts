import { Injectable, inject } from '@angular/core';
import { LogisTrackService } from './logistrack.service';
import { Observable, map } from 'rxjs';
import { OrderFilters, ApiResponse, ShippingOrder } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ShippingService {
  private readonly _baseService: LogisTrackService = inject(LogisTrackService);

  constructor() {}

  public getOrders(filters: Partial<OrderFilters> = {}): Observable<ApiResponse<ShippingOrder[]>> {
    return this._baseService.getShippingOrders(filters).pipe(map((response) => response || []));
  }
}
