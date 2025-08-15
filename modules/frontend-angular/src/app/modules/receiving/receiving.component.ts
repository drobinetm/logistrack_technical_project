import { Component, OnInit, ViewChild, inject, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ReceivingService } from '../../services/receiving.service';
import { ReceptionOrder } from '../../interfaces/logistrack.interfaces';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-receiving',
  standalone: true,
  templateUrl: './receiving.component.html',
  providers: [{ provide: 'BASE_API_URL', useValue: 'http://localhost:8000/api' }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatBadgeModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatNativeDateModule,
  ],
  styleUrls: ['./receiving.component.scss'],
})
export class ReceivingComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Data
  orders: ReceptionOrder[] = [];
  dataSource = new MatTableDataSource<ReceptionOrder>([]);
  displayedColumns: string[] = ['id', 'origin', 'date', 'status', 'driver', 'weight', 'incidents'];

  // Orders with incidents
  ordersWithIncidents: ReceptionOrder[] = [];

  // Filter form
  filterForm: FormGroup;
  statusFilter = new FormControl('');
  dispatchDate = new FormControl<Date | null>(null);
  hasIncidents = new FormControl(false);

  // Status counts
  statusCounts = {
    total: 0,
    delivered: 0,
    inTransit: 0,
    pending: 0,
    withIssues: 0,
  };

  // UI state
  isLoading = false;
  panelOpenState = false;
  selectedOrder: ReceptionOrder | null = null;

  private snackBar = inject(MatSnackBar);
  private receivingService = inject(ReceivingService);

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      search: [''],
      status: this.statusFilter,
      dispatchDate: this.dispatchDate,
      hasIncidents: this.hasIncidents,
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.setupFilters();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator!;
    this.loadOrders();
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.loadOrders();
  }

  hasActiveFilters(): boolean {
    const values = this.filterForm.value;
    return !!values.search || !!values.status || !!values.dispatchDate || values.hasIncidents;
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      status: '',
      dispatchDate: null,
      hasIncidents: false,
    });
  }

  loadOrders(): void {
    this.isLoading = true;

    // Get current filter values
    const filters = this.filterForm.value;
    const params: any = {};

    // Add status filter if set
    if (filters.status) {
      params.status = filters.status;
    }

    // Add despacho date filter if set
    if (filters.dispatchDate) {
      params.date = new Date(filters.dispatchDate);
    }

    // Add incidents filter if set
    if (filters.hasIncidents) {
      params.hasIncidents = true;
    }

    this.receivingService
      .getOrders(params)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          const orders = Array.isArray(response) ? response : response?.data || [];
          this.orders = orders.map((order) => {
            const parseDate = (dateString: string | null | undefined): Date | null => {
              if (!dateString) return null;
              const dateStr = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
              return new Date(dateStr);
            };

            return {
              ...order,
              dispatchDate: order.dispatchDate ? parseDate(order.dispatchDate) : null,
              date: order.date ? parseDate(order.date) : null,
              driver: order.driver || undefined,
              incidents: order.incidents || [],
            };
          });

          // Update data source
          this.dataSource.data = this.orders;

          // Update status counts
          this.updateStatusCounts();

          // Update orders with incidents
          this.ordersWithIncidents = this.orders.filter(
            (order) => order.incidents && order.incidents.length > 0
          );
        },
        error: () => {
          this.snackBar.open('Error al cargar las órdenes', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  updateStatusCounts(): void {
    if (!this.orders.length) {
      this.statusCounts = {
        total: 0,
        delivered: 0,
        inTransit: 0,
        pending: 0,
        withIssues: 0,
      };
      return;
    }

    this.statusCounts = {
      total: this.orders.length,
      delivered: this.orders.filter((o) => o.status === 'ENTREGADO').length,
      inTransit: this.orders.filter((o) => o.status === 'EN_CAMINO').length,
      pending: this.orders.filter((o) => o.status === 'EN_ESPERA').length,
      withIssues: this.orders.filter((o) => (o as any).incidents?.length > 0).length,
    };
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ENTREGADO':
        return 'check_circle';
      case 'EN_CAMINO':
        return 'directions_car';
      case 'LISTO_PARA_ENVIAR':
        return 'pending_actions';
      case 'EN_ESPERA':
        return 'schedule';
      default:
        return 'help_outline';
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      ENTREGADO: 'Entregado',
      EN_CAMINO: 'En Camino',
      LISTO_PARA_ENVIAR: 'Listo para Enviar',
      EN_ESPERA: 'En Espera',
    };
    return statusMap[status] || status;
  }

  getDriverName(order: ReceptionOrder): string {
    const driver = (order as any).driver;
    if (!driver) return 'Sin asignar';
    return [driver.firstName, driver.lastName].filter(Boolean).join(' ').trim();
  }

  // Get the total number of received orders
  getTotalReceived(): number {
    return this.orders.length;
  }

  // Get the total number of incidents across all orders
  getIncidents(): number {
    return this.orders.reduce((total, order) => {
      return total + ((order.incidents && order.incidents.length) || 0);
    }, 0);
  }

  // Get the number of orders received today
  getReceivedToday(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.orders.filter((order) => {
      if (!order.date) return false;
      const orderDate = new Date(order.date);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    }).length;
  }

  // Get the number of pending orders
  getPendingReception(): number {
    return this.orders.filter(
      (order) => order.status === 'PENDIENTE' || order.status === 'EN_ESPERA'
    ).length;
  }

  // Get the number of orders with issues
  getWithIssues(): number {
    return this.orders.filter((order) => order.incidents && order.incidents.length > 0).length;
  }
}
