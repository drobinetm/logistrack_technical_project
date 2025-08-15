import { Injectable, inject } from '@angular/core';
import { LogisTrackService } from './logistrack.service';
import { Observable, map } from 'rxjs';
import { OrderFilters, ApiResponse, ConsolidationGroup } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ConsolidationService {
  private readonly _baseService: LogisTrackService = inject(LogisTrackService);

  constructor() {}

  public getOrders(
    filters: Partial<OrderFilters> = {}
  ): Observable<ApiResponse<ConsolidationGroup[]>> {
    return this._baseService
      .getConsolidationGroups(filters)
      .pipe(map((response) => response || []));
  }
}
