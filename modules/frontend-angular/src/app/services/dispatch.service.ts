import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { LogisTrackService } from './logistrack.service';
import { DispatchOrder, OrderFilters } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DispatchService {
  constructor(private apiService: LogisTrackService) {}

  getOrders(filters: Partial<OrderFilters> = {}): Observable<DispatchOrder[]> {
    // Ensure we have a valid filters object
    const queryFilters: Partial<OrderFilters> = { ...filters };
    return this.apiService.getDispatchOrders(filters).pipe(
      map(response => response.data)
    );
  }

  getOrderById(id: string | number): Observable<DispatchOrder> {
    return this.apiService.getDispatchOrderById(id).pipe(
      map(response => response.data)
    );
  }
}
