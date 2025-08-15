import { Injectable, inject } from '@angular/core';
import { LogisTrackService } from './logistrack.service';
import { Observable, map } from 'rxjs';
import { DistributionOrder, OrderFilters, ApiResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DistributionService {
  private readonly _baseService: LogisTrackService = inject(LogisTrackService);

  constructor() {}

  public getOrders(
    filters: Partial<OrderFilters> = {}
  ): Observable<ApiResponse<DistributionOrder[]>> {
    return this._baseService.getDistributionOrders(filters).pipe(map((response) => response || []));
  }
}
