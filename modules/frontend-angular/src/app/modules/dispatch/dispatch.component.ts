import { AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
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
  templateUrl: './dispatch.component.html',
  providers: [{ provide: 'BASE_API_URL', useValue: 'http://localhost:8000/api' }],
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
    MapComponent,
  ],
  styleUrls: ['./dispatch.component.scss'],
})
export class DispatchComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  displayedColumns: string[] = [
    'id',
    'origin',
    'destination',
    'dispatchDate',
    'cdPyme',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<DispatchOrder>([]);
  filterForm: FormGroup;
  showMap = false;
  selectedOrder: DispatchOrder | null = null;
  routeMarkers: MapMarker[] = [];
  isLoading = false;
  currentFilters: Partial<OrderFilters> = {};

  // Services
  private readonly dispatchService = inject(DispatchService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  constructor() {
    // Initialize form in constructor to avoid issues with injection timing
    this.filterForm = this.fb.group({
      search: [''],
      cdPyme: [''],
      date: [''],
    });

    // Subscribe to form changes
    this.filterForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });
  }

  ngAfterViewInit(): void {
    // Set up the paginator and sort after the view is initialized
    this.setupTable();
  }

  ngOnInit(): void {
    // Set up filter predicate
    this.dataSource.filterPredicate = (data: DispatchOrder, filter: string): boolean => {
      const searchStr = JSON.stringify(data).toLowerCase();
      return searchStr.indexOf(filter) !== -1;
    };

    // Initial data load
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupTable(): void {
    // Connect paginator and sort to the data source
    this.dataSource.paginator = this.paginator;

    // Set up sorting
    if (this.sort) {
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (
        item: DispatchOrder,
        property: string
      ): string | number => {
        // Handle dispatchDate field specifically
        if (property === 'dispatchDate') {
          const date = item.dispatchDate;
          if (!date) return '';
          // Convert to Date if it's a string
          const dateObj = typeof date === 'string' ? new Date(date) : date;
          return isNaN(dateObj.getTime()) ? '' : dateObj.toISOString();
        }

        // Handle other fields
        const value = item[property as keyof DispatchOrder];
        if (value === undefined || value === null) return '';
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'number') return value;
        return String(value);
      };
    }
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
      cdPyme: (order.cdPyme || order.cd_pyme || 'CD') as 'CD' | 'Pyme',
      status: this.mapStatusToKey(order.status || ''),
      dispatchDate: order.dispatchDate ? new Date(order.dispatchDate) : new Date(),
      latitude: order.latitude || order.lat || 0,
      longitude: order.longitude || order.lng || 0,
      createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
      updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
    };
  }

  private mapStatusToKey(status: string): 'pending' | 'in-progress' | 'completed' | 'error' {
    if (!status) return 'pending';
    const s = String(status).toLowerCase().trim();
    // Spanish and English variants
    if (['pendiente', 'pending'].includes(s)) return 'pending';
    if (
      [
        'en despacho',
        'en_despacho',
        'despacho',
        'en proceso',
        'en_proceso',
        'proceso',
        'in progress',
        'in-progress',
      ].includes(s)
    )
      return 'in-progress';
    if (['completado', 'completada', 'completed', 'finalizado', 'finalizada'].includes(s))
      return 'completed';
    if (['error', 'rechazado', 'rechazada', 'failed', 'fallido', 'fallida'].includes(s))
      return 'error';
    return 'pending';
  }

  private loadData(): void {
    this.isLoading = true;

    // Create filters for the API request
    const apiFilters: any = { ...this.currentFilters };

    // Remove status filter if it exists
    if ('status' in apiFilters) {
      delete apiFilters.status;
    }

    // Format the date for the API if it exists
    if (apiFilters.date) {
      try {
        // Ensure we have a proper Date object
        const date = apiFilters.date instanceof Date ? apiFilters.date : new Date(apiFilters.date);

        if (!isNaN(date.getTime())) {
          // Format as YYYY-MM-DD for the API
          apiFilters.date = date.toISOString().split('T')[0];
        } else {
          // If date is invalid, remove it from filters
          delete apiFilters.date;
        }
      } catch (e) {
        delete apiFilters.date;
      }
    }

    this.dispatchService.getOrders(apiFilters).subscribe({
      next: (orders) => {
        try {
          // Normalize and validate orders from the API
          const normalizedOrders = Array.isArray(orders)
            ? orders.map((order) => this.normalizeOrder(order))
            : [];

          // Create a new MatTableDataSource to ensure change detection works
          this.dataSource = new MatTableDataSource<DispatchOrder>(normalizedOrders);

          // Set up the table with the new data source
          this.setupTable();

          // Trigger change detection
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        } catch (error) {
          this.snackBar.open('Error al procesar los datos de las órdenes', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          this.dataSource.data = [];
        } finally {
          this.isLoading = false;
        }
      },
      error: () => {
        this.snackBar.open('Error al cargar las órdenes', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        this.isLoading = false;
        this.dataSource.data = [];
      },
    });
  }

  private filterData(): void {
    const searchTerm = (this.currentFilters.search || '').toLowerCase().trim();
    const cdPymeFilter = this.currentFilters.cdPyme || '';

    this.dataSource.filterPredicate = (data: DispatchOrder) => {
      let matches = true;

      // Apply search filter
      if (searchTerm) {
        matches = ['id', 'origin', 'destination'].some((prop) =>
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
      timestamp: new Date().getTime(), // Ensure filter triggers on every call
    });
  }

  applyFilters(): void {
    const formValue = this.filterForm.value;

    // Update current filters with form values
    this.currentFilters = { ...formValue };

    // If we have a date filter, reload data from server
    if (formValue.date) {
      // Format the date for the API
      this.currentFilters.date = new Date(formValue.date);
      this.loadData();
    } else {
      // If date was cleared, ensure it's removed from filters
      if ('date' in this.currentFilters) {
        delete this.currentFilters.date;
      }

      // Trigger client-side filtering
      this.filterData();
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentFilters = {};
    this.dataSource.filter = '';
    this.loadData();
  }

  showOnMap(order: DispatchOrder): void {
    this.selectedOrder = { ...order };

    // Create new markers array to trigger change detection
    const newMarkers: MapMarker[] = [
      {
        lat: -33.4489 + Math.random() * 0.01,
        lng: -70.6693 + Math.random() * 0.01,
        title: this.selectedOrder.origin,
        color: 'blue',
        popup: `<b>Origen</b><br>${this.selectedOrder.origin}`,
      },
      {
        lat: this.selectedOrder.latitude || -33.4489 + Math.random() * 0.01,
        lng: this.selectedOrder.longitude || -70.6693 + Math.random() * 0.01,
        title: this.selectedOrder.destination,
        color: 'red',
        popup: `<b>Destino</b><br>${this.selectedOrder.destination}`,
      },
    ];

    // Update markers directly through the MapComponent if it exists
    if (this.mapComponent) {
      this.mapComponent.updateMarkers(newMarkers);
    } else {
      // Fallback to updating the markers array
      this.routeMarkers = [...newMarkers];
    }

    this.showMap = true;
  }

  hideMap(): void {
    this.showMap = false;
    this.selectedOrder = null;
  }

  getStatusIcon(status: string = ''): string {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'pending':
        return 'schedule';
      case 'in-progress':
        return 'sync';
      default:
        return 'info';
    }
  }

  getStatusText(status: string = ''): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Pendiente';
      case 'in-progress':
        return 'En Progreso';
      default:
        return 'Desconocido';
    }
  }
}
