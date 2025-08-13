import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Subject, takeUntil } from 'rxjs';
import { MapComponent, MapMarker } from '../../shared/map.component';
import { DispatchOrder, OrderFilters } from '../../interfaces';
import { DispatchService } from '../../services/dispatch.service';

@Component({
  selector: 'app-dispatch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MapComponent
  ],
  template: `
    <div class="dispatch-container">
      <div class="header">
        <h1>Dispatch Management</h1>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>Filtros</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Buscar</mat-label>
              <input matInput placeholder="ID, origen, destino..." formControlName="search">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="cdPyme">
                <mat-option value="">Todos</mat-option>
                <mat-option value="CD">CD</mat-option>
                <mat-option value="Pyme">Pyme</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha de Despacho</mat-label>
              <input matInput [matDatepicker]="picker1" formControlName="dispatchDate">
              <mat-datepicker-toggle matSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>
          </form>

          <div class="filter-actions">
            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Limpiar Filtros
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Data Table -->
      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>Órdenes de Despacho</mat-card-title>
          <mat-card-subtitle>{{ dataSource.data.length }} órdenes encontradas</mat-card-subtitle>

        </mat-card-header>
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                <td mat-cell *matCellDef="let element">
                  <span class="order-id">{{ element.id }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="origin">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Origen</th>
                <td mat-cell *matCellDef="let element">{{ element.origin }}</td>
              </ng-container>

              <ng-container matColumnDef="destination">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Destino</th>
                <td mat-cell *matCellDef="let element">{{ element.destination }}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha</th>
                <td mat-cell *matCellDef="let element">{{ element.date | date:'dd/MM/yyyy' }}</td>
              </ng-container>

              <ng-container matColumnDef="cdPyme">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip [class]="'type-' + element.cdPyme.toLowerCase()">
                    {{ element.cdPyme === 'CD' ? 'Centro de Distribución' : 'Pyme' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip [class]="'status-' + element.status">
                    <mat-icon>{{ getStatusIcon(element.status) }}</mat-icon>
                    {{ getStatusText(element.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button color="accent" (click)="showOnMap(element)" matTooltip="Ver en mapa">
                    <mat-icon>map</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <mat-paginator
            [pageSizeOptions]="[10, 25, 50]"
            showFirstLastButtons
            aria-label="Seleccionar página">
          </mat-paginator>
        </mat-card-content>
      </mat-card>

      <!-- Map Section -->
      <mat-card class="map-card" *ngIf="showMap && selectedOrder">
        <mat-card-header>
          <mat-card-title>Ubicación - {{ selectedOrder.id }}</mat-card-title>
          <mat-card-subtitle>{{ selectedOrder.origin }} → {{ selectedOrder.destination }}</mat-card-subtitle>
          <button mat-icon-button (click)="hideMap()">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <app-map
            [markers]="routeMarkers"
            [fullHeight]="true">
          </app-map>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dispatch-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-weight: 300;
      color: #333;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: start;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .table-card {
      margin-bottom: 24px;
    }

    .card-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }

    .table-container {
      overflow-x: auto;
      max-width: 100%;
    }

    .mat-mdc-table {
      width: 100%;
      min-width: 800px;
    }

    .order-id {
      font-weight: 500;
      color: #1976d2;
    }

    .type-cd {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .type-pyme {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .status-in-progress {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-completed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-error {
      background-color: #ffebee;
      color: #c62828;
    }

    .mat-mdc-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .mat-mdc-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .actions-container {
      display: flex;
      gap: 4px;
    }

    .map-card {
      margin-bottom: 24px;
    }

    .map-card mat-card-header {
      display: flex;
      align-items: center;
    }

    .map-card mat-card-header button {
      margin-left: auto;
    }

    @media (max-width: 768px) {
      .filters-form {
        grid-template-columns: 1fr;
      }

      .card-actions {
        display: none;
      }

      .mat-mdc-table {
        min-width: 600px;
      }
    }
  `]
})
export class DispatchComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'origin', 'destination', 'date', 'cdPyme', 'status', 'actions'];
  dataSource = new MatTableDataSource<DispatchOrder>([]);
  filterForm: FormGroup;
  showMap = false;
  selectedOrder: DispatchOrder | null = null;
  routeMarkers: MapMarker[] = [];

  // Base URL for backend API
  private destroy$ = new Subject<void>();
  isLoading = false;
  currentFilters: Partial<OrderFilters> = {};

  constructor(
    private fb: FormBuilder,
    private dispatchService: DispatchService,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      cdPyme: [''],
      status: [''],
      dispatchDate: ['']
    });
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private normalizeOrder(order: any): DispatchOrder {
    // Ensure we have a valid order object
    if (!order) {
      throw new Error('Invalid order data');
    }

    // Map the API response to our DispatchOrder interface
    return {
      id: order.id?.toString() || '',
      code: order.code || order.id?.toString() || '',
      origin: order.origin || 'Origen no especificado',
      destination: order.destination || 'Destino no especificado',
      cdPyme: order.cdPyme || order.cd_pyme || 'CD',
      status: this.mapStatusToKey(order.status || ''),
      dispatchDate: order.dispatchDate ? new Date(order.dispatchDate) : new Date(),
      latitude: order.latitude || order.lat || 0,
      longitude: order.longitude || order.lng || 0,
      createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
      updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date()
    };
  }

  private mapStatusToKey(status: string): 'pending' | 'in-progress' | 'completed' | 'error' {
    if (!status) return 'pending';
    const s = String(status).toLowerCase().trim();
    // Spanish and English variants
    if (['pendiente', 'pending'].includes(s)) return 'pending';
    if (['en despacho', 'en_despacho', 'despacho', 'en proceso', 'en_proceso', 'proceso', 'in progress', 'in-progress'].includes(s)) return 'in-progress';
    if (['completado', 'completada', 'completed', 'finalizado', 'finalizada'].includes(s)) return 'completed';
    if (['error', 'rechazado', 'rechazada', 'failed', 'fallido', 'fallida'].includes(s)) return 'error';
    return 'pending';
  }

  private loadData(): void {
    this.isLoading = true;

    const filters: Partial<OrderFilters> = {
      ...this.currentFilters
    };

    if (this.currentFilters?.dispatchDate) {
      filters.startDate = new Date(this.currentFilters.dispatchDate);
    }

    this.dispatchService.getOrders(filters).subscribe({
      next: (orders) => {
        try {
          // Normalize and validate orders from the API
          this.dataSource.data = Array.isArray(orders)
            ? orders.map(order => this.normalizeOrder(order))
            : [];

          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
        } catch (error) {
          console.error('Error normalizing orders:', error);
          this.snackBar.open('Error al procesar los datos de las órdenes', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.dataSource.data = [];
        } finally {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading dispatch orders:', error);
        this.snackBar.open('Error al cargar las órdenes', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
        this.dataSource.data = [];
      }
    });
  }

  ngOnInit(): void {
    this.loadData();
    // Initial empty filter
    this.dataSource.filterPredicate = () => true;
  }

  applyFilters(): void {
    this.currentFilters = { ...this.filterForm.value };

    // If we have a date filter, reload data from server
    if (this.currentFilters.dispatchDate) {
      this.loadData();
    } else {
      // Trigger client-side filtering
      this.filterData();
    }
  }

  // Custom filtering function
  private filterData(): void {
    const searchTerm = (this.currentFilters.search || '').toLowerCase().trim();
    const cdPymeFilter = this.currentFilters.cdPyme || '';

    this.dataSource.filterPredicate = (data: DispatchOrder) => {
      let matches = true;

      // Apply search filter
      if (searchTerm) {
        matches = ['id', 'origin', 'destination'].some(prop =>
          data[prop as keyof DispatchOrder]?.toString().toLowerCase().includes(searchTerm)
        );
      }

      // Apply CD/PYME filter
      if (matches && cdPymeFilter) {
        matches = data.cdPyme === cdPymeFilter;
      }

      return matches;
    };

    // Trigger filtering with a unique value to force update
    this.dataSource.filter = JSON.stringify({
      search: searchTerm,
      cdPyme: cdPymeFilter,
      timestamp: new Date().getTime() // Ensure filter triggers on every call
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentFilters = {};
    this.dataSource.filter = '';
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  viewOrder(order: DispatchOrder): void {
    console.log('Viewing order:', order);
    // TODO: Open order detail dialog
  }

  showOnMap(order: DispatchOrder): void {
    this.selectedOrder = order;
    this.routeMarkers = [
      {
        lat: -33.4489 + Math.random() * 0.01,
        lng: -70.6693 + Math.random() * 0.01,
        title: order.origin,
        color: 'blue',
        popup: `<b>Origen</b><br>${order.origin}`
      },
      {
        lat: order.latitude || -33.4489 + Math.random() * 0.01,
        lng: order.longitude || -70.6693 + Math.random() * 0.01,
        title: order.destination,
        color: 'red',
        popup: `<b>Destino</b><br>${order.destination}`
      }
    ];
    this.showMap = true;
  }

  hideMap(): void {
    this.showMap = false;
    this.selectedOrder = null;
  }

  getStatusIcon(status: string = ''): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'error': return 'error';
      case 'pending': return 'schedule';
      case 'in-progress': return 'sync';
      default: return 'info';
    }
  }

  getStatusText(status: string = ''): string {
    switch (status) {
      case 'completed': return 'Completado';
      case 'error': return 'Error';
      case 'pending': return 'Pendiente';
      case 'in-progress': return 'En Progreso';
      default: return 'Desconocido';
    }
  }
}
