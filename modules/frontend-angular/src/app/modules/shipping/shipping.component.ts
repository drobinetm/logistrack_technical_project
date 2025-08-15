import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ShippingService } from '../../services/shipping.service';
import { ShippingOrder, MapMarker } from '../../interfaces/logistrack.interfaces';
import { CarrierGroup } from '../../interfaces/shipping.interfaces';
import { MapComponent } from '../../shared/map.component';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MapComponent,
  ],
  providers: [{ provide: 'BASE_API_URL', useValue: 'http://localhost:8000/api' }],
})
export class ShippingComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('mapComponent') mapComponent!: MapComponent;

  // Table data source and columns
  displayedColumns: string[] = ['id', 'driver', 'destination', 'date', 'bags', 'status', 'actions'];
  allShipmentsDataSource = new MatTableDataSource<ShippingOrder>([]);
  orders: ShippingOrder[] = [];
  filteredOrders: ShippingOrder[] = [];

  // Map properties
  selectedOrder: ShippingOrder | null = null;
  routeMarkers: MapMarker[] = [];

  dateFilter = new FormControl('');
  selectedDate: Date | null = null;
  statusFilter = new FormControl('');

  isLoading = false;

  constructor(private shippingService: ShippingService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.setupDateFilter();
  }

  ngAfterViewInit(): void {
    this.setupTable();
  }

  private setupTable(): void {
    // Connect paginator and sort to the data source
    this.allShipmentsDataSource.paginator = this.paginator;

    // Set up sorting
    if (this.sort) {
      this.allShipmentsDataSource.sort = this.sort;
      this.allShipmentsDataSource.sortingDataAccessor = (
        item: ShippingOrder,
        property: string
      ): string | number => {
        // Handle date fields specifically
        if (property === 'date' && item.date) {
          const date = item.date;
          const dateObj = typeof date === 'string' ? new Date(date) : date;
          return isNaN(dateObj.getTime()) ? '' : dateObj.toISOString();
        }

        // Handle other fields
        const value = item[property as keyof ShippingOrder];
        if (value === undefined) return '';
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'number') return value;
        return String(value);
      };
    }
  }

  private setupDateFilter(): void {
    this.dateFilter.valueChanges.subscribe((value: string | Date | null) => {
      this.selectedDate = value ? new Date(value) : null;
      this.applyDateFilter();
    });
  }

  loadOrders(dateFilter?: string): void {
    this.isLoading = true;

    // Prepare query params
    const params: any = {};
    if (dateFilter) {
      params.date = dateFilter;
    }

    this.shippingService
      .getOrders(params)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          const ordersArray = Array.isArray(response) ? response : response.data || [];

          this.orders = ordersArray.map((order: any) => ({
            ...order,
            driver: {
              id: order.driver?.id || 0,
              firstName: order.driver?.firstName || 'No',
              lastName: order.driver?.lastName || 'asignado',
              licensePlate: order.driver?.licensePlate || '',
              email: order.driver?.email,
              phone: order.driver?.phone,
            },
            carrier: this.getRandomCarrier(),
            route: this.getRandomRoute(),
            estimatedTime: this.getEstimatedTime(),
            bags: order.numberOfBags,
            date: order.dispatchDate,
            status: this.normalizeStatus(order.status),
          }));

          this.filteredOrders = [...this.orders];
          this.allShipmentsDataSource.data = this.filteredOrders;
          this.allShipmentsDataSource.paginator = this.paginator;
          this.allShipmentsDataSource.sort = this.sort;
        },
        error: () => {
          this.orders = [];
          this.allShipmentsDataSource.data = [];
        },
      });
  }

  private normalizeStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      COMPLETADO: 'completed',
      EN_PROCESO: 'in-progress',
      PENDIENTE: 'pending',
    };
    return statusMap[status] || 'pending';
  }

  private getRandomCarrier(): string {
    const carriers = ['TransChile', 'LogisExpress', 'RapidoCargo', 'ChileDelivery', 'TransAndes'];
    return carriers[Math.floor(Math.random() * carriers.length)];
  }

  private getRandomVehicle(): string {
    const vehicles = [
      'Camión 3/4',
      'Camión 5 Toneladas',
      'Furgón',
      'Camioneta',
      'Camión 10 Toneladas',
      'Tracto Camión',
    ];
    return vehicles[Math.floor(Math.random() * vehicles.length)];
  }

  private getRandomRoute(): string {
    const routes = ['Ruta Norte', 'Ruta Sur', 'Ruta Centro', 'Ruta Costa', 'Ruta Cordillera'];
    return routes[Math.floor(Math.random() * routes.length)];
  }

  private getEstimatedTime(): string {
    const hours = Math.floor(Math.random() * 8) + 1;
    return `${hours}h ${Math.floor(Math.random() * 60)}min`;
  }

  getTotalShipments(): number {
    return this.orders.length;
  }

  getActiveDrivers(): number {
    const driverIds = this.orders
      .map((o) => o.driver?.id)
      .filter((id): id is number => id !== undefined && id !== 0);
    return new Set(driverIds).size;
  }

  getPendingShipments(): number {
    return this.orders.filter((o) => o.status === 'pending').length;
  }

  getTotalBags(): number {
    return this.orders.reduce((total, order) => total + (order.numberOfBags || 0), 0);
  }

  getCarrierGroups(): CarrierGroup[] {
    // Define type for the grouped object
    const grouped: { [key: string]: ShippingOrder[] } = this.orders.reduce<{
      [key: string]: ShippingOrder[];
    }>((groups, order) => {
      const carrier = order.carrier || 'Sin asignar';

      if (!groups[carrier]) {
        groups[carrier] = [];
      }
      groups[carrier].push(order);
      return groups;
    }, {});

    return Object.entries(grouped).map(([name, orders]) => {
      const firstOrder = orders[0];
      const driverName = firstOrder.driver
        ? `${firstOrder.driver.firstName} ${firstOrder.driver.lastName}`
        : 'Conductor no asignado';
      const licensePlate = firstOrder.driver?.licensePlate || '';

      return {
        name: `${firstOrder.volume} / ${firstOrder.weight}`,
        driverName,
        licensePlate,
        orders,
        totalOrders: orders.length,
        totalBags: orders.reduce((sum, order) => sum + (order.bags || 0), 0),
        vehicle: this.getRandomVehicle(),
        volume: `${firstOrder.volume} kg`,
        weight: `${firstOrder.weight} cm`,
      };
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'in-progress':
        return 'local_shipping';
      case 'pending':
        return 'schedule';
      default:
        return 'help_outline';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En Ruta';
      case 'pending':
        return 'Pendiente';
      case 'COMPLETADO':
        return 'Completado';
      case 'EN_PROCESO':
        return 'En Ruta';
      case 'PENDIENTE':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  }

  applyFilter(event: Event, tab: string): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.allShipmentsDataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByStatus(status: string): void {
    if (!status) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter((order) => order.status === status);
    }
    this.allShipmentsDataSource.data = this.filteredOrders;
    this.statusFilter.setValue(status, { emitEvent: false });
  }

  clearDateFilter(): void {
    this.dateFilter.setValue(null);
    // No need to call applyDateFilter() as it will be triggered by valueChanges
  }

  clearAllFilters(): void {
    // Clear search input
    const searchInput = document.querySelector('.search-filter input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
      this.applyFilter({ target: { value: '' } } as any, 'all');
    }

    // Clear status filter
    this.filterByStatus('');

    // Clear date filter
    this.clearDateFilter();
  }

  hasActiveFilters(): boolean {
    // Check search input
    const searchInput = document.querySelector('.search-filter input') as HTMLInputElement;
    const hasSearch = searchInput?.value?.trim() !== '';

    // Check status filter
    const hasStatus = !!this.statusFilter.value;

    // Check date filter
    const hasDate = !!this.dateFilter.value;

    return hasSearch || hasStatus || hasDate;
  }

  private applyDateFilter(): void {
    if (!this.selectedDate) {
      // Reload all orders if no date filter is selected
      this.loadOrders();
    } else {
      // Format date as YYYY-MM-DD for the API
      const year = this.selectedDate.getFullYear();
      const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      // Only load orders if the date has actually changed
      const currentOrder = this.allShipmentsDataSource.data[0];
      if (currentOrder) {
        const dispatchDate = currentOrder.dispatchDate;
        const currentDateStr =
          typeof dispatchDate === 'string'
            ? dispatchDate.split('T')[0]
            : new Date(dispatchDate).toISOString().split('T')[0];

        if (currentDateStr !== formattedDate) {
          this.loadOrders(formattedDate);
        }
      } else {
        this.loadOrders(formattedDate);
      }
    }
  }

  closeRouteCard(): void {
    this.selectedOrder = null;
    this.routeMarkers = [];
  }

  trackRoute(order: ShippingOrder): void {
    // If clicking the same order, close it
    if (this.selectedOrder && this.selectedOrder.id === order.id) {
      this.selectedOrder = null;
      this.routeMarkers = [];
      return;
    }

    // Create a deep copy to ensure change detection
    this.selectedOrder = { ...order };

    // Generate consistent but unique coordinates based on order ID for demo purposes
    const orderIdHash = order.id
      .toString()
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latOffset = (orderIdHash % 10) * 0.01;
    const lngOffset = ((orderIdHash + 7) % 10) * 0.01;

    // Create markers for origin and destination
    const newMarkers: MapMarker[] = [
      {
        lat: -33.4489 + latOffset,
        lng: -70.6693 + lngOffset,
        title: 'Origen',
        color: 'blue',
        popup: `<b>Origen</b><br>${order.origin || 'Origen no especificado'}`,
      },
      {
        lat: -33.4489 + latOffset + 0.02, // Slightly offset from origin
        lng: -70.6693 + lngOffset + 0.02, // Slightly offset from origin
        title: order.destination || 'Destino',
        color: 'red',
        popup: `<b>Destino</b><br>${order.destination || 'Destino no especificado'}`,
      },
    ];

    // Update markers with a new array reference to trigger change detection
    this.routeMarkers = [...newMarkers];

    // Ensure the map component updates its markers
    if (this.mapComponent) {
      // Small delay to ensure the markers array is updated
      setTimeout(() => {
        this.mapComponent.updateMarkers([...this.routeMarkers]);
      }, 10);
    }

    // Scroll to the route card
    setTimeout(() => {
      const element = document.querySelector('.route-card');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }
}
