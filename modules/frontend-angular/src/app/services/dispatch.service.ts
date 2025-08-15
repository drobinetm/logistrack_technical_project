import { Injectable, inject } from '@angular/core';
import { LogisTrackService } from './logistrack.service';
import { Observable, map } from 'rxjs';
import { DispatchOrder, OrderFilters, ApiResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DispatchService {
  private readonly _baseService: LogisTrackService = inject(LogisTrackService);

  constructor() {}

  public getOrders(filters: Partial<OrderFilters> = {}): Observable<ApiResponse<DispatchOrder[]>> {
    return this._baseService.getDispatchOrders(filters).pipe(map((response) => response || []));
  }
}
