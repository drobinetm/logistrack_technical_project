import { Injectable, inject } from '@angular/core';
import { LogisTrackService } from './logistrack.service';
import { Observable, map } from 'rxjs';
import { OrderFilters, ApiResponse, ReceptionOrder } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ReceivingService {
  private readonly _baseService: LogisTrackService = inject(LogisTrackService);

  constructor() {}

  public getOrders(filters: Partial<OrderFilters> = {}): Observable<ApiResponse<ReceptionOrder[]>> {
    return this._baseService.getReceptionOrders(filters).pipe(map((response) => response || []));
  }
}
