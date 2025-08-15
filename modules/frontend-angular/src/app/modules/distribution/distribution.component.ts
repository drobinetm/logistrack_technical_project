import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DistributionService } from '../../services/distribution.service';
import { DistributionOrder } from '../../interfaces/logistrack.interfaces';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-distribution',
  standalone: true,
  templateUrl: './distribution.component.html',
  providers: [{ provide: 'BASE_API_URL', useValue: 'http://localhost:8000/api' }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatTabsModule,
    MatBadgeModule,
    MatExpansionModule,
    MatDialogModule,
    MatProgressBarModule,
  ],
  styleUrls: ['./distribution.component.scss'],
})
export class DistributionComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private distributionService = inject(DistributionService);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = [
    'id',
    'destination',
    'driver',
    'deliveryDate',
    'status',
    'confirmation',
    'attempts',
  ];
  dataSource = new MatTableDataSource<DistributionOrder>();
  filterForm: FormGroup;
  isLoading = false;

  orders: DistributionOrder[] = [];
  routeMarkers: any[] = [];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      driver: [''],
      dateFrom: [''],
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(dateFilter?: string): void {
    this.isLoading = true;
    this.orders = [];
    this.dataSource.data = [];

    // Prepare query params
    const params: any = {};
    if (dateFilter) {
      params.date = dateFilter;
    }

    this.distributionService
      .getOrders(params)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          // Handle different response formats
          const ordersArray = Array.isArray(response) ? response : response?.data || [];

          if (!ordersArray.length) {
            return;
          }

          // Map and validate orders
          this.orders = ordersArray
            .filter((order) => order && order.id) // Filter out invalid orders
            .map((order) => this.mapToDeliveryOrder(order));

          // Update data source with new data
          this.dataSource = new MatTableDataSource<DistributionOrder>([...this.orders]);

          // Set up sorting and pagination
          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
            if (this.sort) {
              this.dataSource.sort = this.sort;
            }

            // Apply any active filters
            this.applyFilters();
          });
        },
        error: (error) => {
          this.snackBar.open('Error al cargar los pedidos', 'Cerrar', { duration: 5000 });
          this.orders = [];
          this.dataSource.data = [];
        },
      });
  }

  private mapToDeliveryOrder(order: any): DistributionOrder {
    return {
      ...order,
      id: order.id.toString(),
      code: order.code,
      destination: order.destination,
      confirmation: order.confirmation,
      dispatchDate: order.dispatchDate ? new Date(order.dispatchDate) : new Date(),
      status: this.mapStatus(order.status),
      latitude: order.latitude || null,
      longitude: order.longitude || null,
      driver: {
        id: order.driver?.id || 0,
        firstName: order.driver?.firstName || 'No',
        lastName: order.driver?.lastName || 'asignado',
        licensePlate: order.driver?.licensePlate || '',
        email: order.driver?.email,
        phone: order.driver?.phone,
      },
    };
  }

  private mapStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      ENTREGADO: 'completed',
      EN_RUTA: 'in-progress',
      PENDIENTE: 'pending',
      RECHAZADO: 'error',
    };
    return statusMap[status] || 'pending';
  }

  // Count methods
  getTotalDeliveries(): number {
    return this.orders.length;
  }

  getDeliveredCount(): number {
    return this.orders.filter((o) => o.status === 'completed').length;
  }

  getPendingCount(): number {
    return this.orders.filter((o) => o.status === 'pending').length;
  }

  getRejectedCount(): number {
    return this.orders.filter((o) => o.status === 'error').length;
  }

  getInTransitCount(): number {
    return this.orders.filter((o) => o.status === 'in-progress').length;
  }

  // Percentage methods
  getDeliveredPercentage(): number {
    const total = this.getTotalDeliveries();
    return total > 0 ? Math.round((this.getDeliveredCount() / total) * 100) : 0;
  }

  getPendingPercentage(): number {
    const total = this.getTotalDeliveries();
    return total > 0 ? Math.round((this.getPendingCount() / total) * 100) : 0;
  }

  getRejectedPercentage(): number {
    const total = this.getTotalDeliveries();
    return total > 0 ? Math.round((this.getRejectedCount() / total) * 100) : 0;
  }

  getInTransitPercentage(): number {
    const total = this.getTotalDeliveries();
    return total > 0 ? Math.round((this.getInTransitCount() / total) * 100) : 0;
  }

  // Filter methods
  getDrivers(): string[] {
    return [
      ...new Set(this.orders.filter((o) => o.driver?.firstName).map((o) => o.driver!.firstName)),
    ];
  }

  hasActiveFilters(): boolean {
    const values = this.filterForm.value;
    return Object.values(values).some((val) => !!val);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    let filteredOrders = this.orders.filter((order) => {
      let match = true;

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const codeMatch = order.code ? order.code.toLowerCase().includes(searchTerm) : false;
        const idMatch = order.id.toString().toLowerCase().includes(searchTerm);
        const destinationMatch = order.destination
          ? order.destination.toLowerCase().includes(searchTerm)
          : false;
        const driverFirstNameMatch = order.driver?.firstName
          ? order.driver.firstName.toLowerCase().includes(searchTerm)
          : false;
        const driverLastNameMatch = order.driver?.lastName
          ? order.driver.lastName.toLowerCase().includes(searchTerm)
          : false;

        match =
          (codeMatch ||
            idMatch ||
            destinationMatch ||
            driverFirstNameMatch ||
            driverLastNameMatch) &&
          match;
      }

      // Status filter
      if (filters.status) {
        match = match && order.status === filters.status;
      }

      // Driver filter
      if (filters.driver) {
        const driverName = filters.driver.toLowerCase();
        const firstNameMatch = order.driver?.firstName?.toLowerCase() === driverName;
        const lastNameMatch = order.driver?.lastName?.toLowerCase() === driverName;
        match = match && (firstNameMatch || lastNameMatch);
      }

      // Date filter
      if (filters.dateFrom) {
        const filterDate = new Date(filters.dateFrom.toString());
        if (order.dispatchDate) {
          match = match && new Date(order.dispatchDate) >= filterDate;
        } else {
          match = false;
        }
      }

      return match;
    });

    this.dataSource.data = filteredOrders;

    // Update paginator if it exists
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    // Update sort if it exists
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  // Other helper methods
  getAttemptsColor(attempts: number): string {
    if (attempts <= 1) return 'primary';
    if (attempts <= 2) return 'accent';
    return 'warn';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'in-progress':
        return 'local_shipping';
      case 'pending':
        return 'schedule';
      case 'error':
        return 'cancel';
      default:
        return 'help_outline';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Entregada';
      case 'in-progress':
        return 'En Tránsito';
      case 'pending':
        return 'Pendiente';
      case 'error':
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  }

  viewDeliveryDetails(order: DistributionOrder): void {
    // TODO: Implement delivery details view
  }

  ngAfterViewInit() {
    // Connect the paginator and sort to the data source
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Set up filter predicate for custom filtering
    this.dataSource.filterPredicate = this.createFilter();

    // Apply filters when form values change
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  // Create a custom filter function
  private createFilter(): (data: DistributionOrder, filter: string) => boolean {
    return (data: DistributionOrder, filter: string): boolean => {
      const searchStr = JSON.stringify(data).toLowerCase();
      return searchStr.indexOf(filter) !== -1;
    };
  }
}
