import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PreparationService } from '../../services/preparation.service';
import { PreparationOrder, OrderFilters } from '../../interfaces';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-preparation',
  standalone: true,
  templateUrl: './preparation.component.html',
  providers: [{ provide: 'BASE_API_URL', useValue: 'http://localhost:8000/api' }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatMenuModule,
  ],
  styleUrls: ['./preparation.component.scss'],
})
export class PreparationComponent implements OnInit {
  orders: PreparationOrder[] = [];
  filteredOrders: PreparationOrder[] = [];
  filterForm: FormGroup;

  completedOrders = 0;
  pendingOrders = 0;
  overallProgress = 0;

  constructor(
    private preparationService: PreparationService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      dateFilter: [null],
    });
  }

  // Clear all filters
  clearFilters(): void {
    this.filterForm.patchValue({
      status: '',
      dateFilter: null,
    });
    this.applyFilters();
  }

  ngOnInit(): void {
    this.loadOrders();

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadOrders(): void {
    // Get current filter values
    const filters = this.filterForm.value;
    const params: any = {};

    // Add status filter if set
    if (filters.status) {
      params.status = filters.status;
    }

    // Add date filter if set
    if (filters.dateFilter) {
      const dispatchDate = new Date(filters.dateFilter);
      params.date = dispatchDate.toISOString().split('T')[0];
    }

    this.preparationService.getOrders(params).subscribe({
      next: (response: any) => {
        // Handle both array response and { data: [] } response formats
        const ordersArray = Array.isArray(response) ? response : response.data || [];

        if (ordersArray && ordersArray.length > 0) {
          // Map the API response to match our component's expectations
          this.orders = ordersArray.map((order: any) => ({
            ...order,
            status: order.status.toLowerCase(),
            date: order.dispatchDate,
            products: order.products || [],
          }));

          this.filteredOrders = [...this.orders];
          this.updateStats();
        } else {
          this.orders = [];
          this.filteredOrders = [];
          this.updateStats();
        }
      },
      error: () => {
        this.orders = [];
        this.filteredOrders = [];
        this.updateStats();
      },
    });
  }

  applyFilters(): void {
    // Instead of client-side filtering, reload the orders with the current filters
    this.loadOrders();
  }

  // Clear just the date filter
  clearDateFilter(): void {
    this.filterForm.patchValue({
      dateFilter: null,
    });
  }

  private updateStats(): void {
    this.completedOrders = this.filteredOrders.filter((o) => o.status === 'completado').length;
    this.pendingOrders = this.filteredOrders.filter((o) => o.status === 'pendiente').length;

    if (this.filteredOrders.length > 0) {
      const totalProgress = this.filteredOrders.reduce(
        (sum, order) => sum + this.getOrderProgress(order),
        0
      );
      this.overallProgress = Math.round(totalProgress / this.filteredOrders.length);
    } else {
      this.overallProgress = 0;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completado':
        return 'check_circle';
      case 'en_proceso':
        return 'sync';
      case 'pendiente':
        return 'schedule';
      default:
        return 'help_outline';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'en_proceso':
        return 'En Proceso';
      case 'pendiente':
        return 'Pendiente';
      default:
        return status;
    }
  }

  getOrderProgress(order: PreparationOrder): number {
    switch (order.status) {
      case 'completado':
        return 100;
      case 'en_proceso':
        return Math.floor(Math.random() * 80) + 10;
      case 'pendiente':
        return 0;
      default:
        return 0;
    }
  }

  getProgressColor(order: PreparationOrder): string {
    const progress = this.getOrderProgress(order);
    if (progress === 100) return 'primary';
    if (progress > 50) return 'accent';
    return 'warn';
  }

  getOrderProgressItems(order: PreparationOrder): { name: string; completed: boolean }[] {
    const items = [
      'Verificar inventario',
      'Recoger productos',
      'Empacar orden',
      'Etiquetar paquetes',
      'Documentación',
    ];

    const progress = this.getOrderProgress(order);
    const completedCount = Math.floor((progress / 100) * items.length);

    return items.map((item, index) => ({
      name: item,
      completed: index < completedCount,
    }));
  }
}
