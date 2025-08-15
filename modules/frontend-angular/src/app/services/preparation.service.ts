import { Injectable, inject } from '@angular/core';
import { LogisTrackService } from './logistrack.service';
import { Observable, map } from 'rxjs';
import { OrderFilters, ApiResponse, PreparationOrder } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class PreparationService {
  private readonly _baseService: LogisTrackService = inject(LogisTrackService);

  constructor() {}

  public getOrders(
    filters: Partial<OrderFilters> = {}
  ): Observable<ApiResponse<PreparationOrder[]>> {
    return this._baseService.getPreparationOrders(filters).pipe(map((response) => response || []));
  }
}
