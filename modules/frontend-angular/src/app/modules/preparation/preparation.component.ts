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
import { DataService, Order } from '../../services/data.service';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-preparation',
  standalone: true,
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
    MatMenuModule
  ],
  template: `
    <div class="preparacion-container">
      <div class="header">
        <h1>Order Preparation</h1>
        <div class="header-stats">
          <div class="stat">
            <span class="stat-number">{{ completedOrders }}</span>
            <span class="stat-label">Completed</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ pendingOrders }}</span>
            <span class="stat-label">Pending</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ overallProgress }}%</span>
            <span class="stat-label">Overall Progress</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="">All</mat-option>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="in-progress">In Progress</mat-option>
                <mat-option value="completed">Completed</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date From</mat-label>
              <input matInput [matDatepicker]="picker1" formControlName="dateFrom">
              <mat-datepicker-toggle matSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha hasta</mat-label>
              <input matInput [matDatepicker]="picker2" formControlName="dateTo">
              <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
              <mat-datepicker #picker2></mat-datepicker>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="applyFilters()">
              <mat-icon>filter_list</mat-icon>
              Filtrar
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Order Cards Grid -->
      <div class="orders-grid">
        <mat-card *ngFor="let order of filteredOrders" class="order-card"
                  [class.completed]="order.status === 'completed'"
                  [class.in-progress]="order.status === 'in-progress'"
                  [class.pending]="order.status === 'pending'">
          <mat-card-header>
            <mat-card-title class="order-title">
              <span>{{ order.id }}</span>
              <mat-chip [class]="'status-' + order.status">
                <mat-icon>{{ getStatusIcon(order.status) }}</mat-icon>
                {{ getStatusText(order.status) }}
              </mat-chip>
            </mat-card-title>
            <mat-card-subtitle>{{ order.destination }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="order-details">
              <div class="detail-item">
                <mat-icon>schedule</mat-icon>
                <span>{{ order.date | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="detail-item">
                <mat-icon>scale</mat-icon>
                <span>{{ order.weight || 0 }} kg</span>
              </div>
              <div class="detail-item">
                <mat-icon>cube</mat-icon>
                <span>{{ order.volume || 0 }} m³</span>
              </div>
            </div>

            <div class="progress-section">
              <div class="progress-header">
                <span>Progreso de preparación</span>
                <span class="progress-percentage">{{ getOrderProgress(order) }}%</span>
              </div>
              <mat-progress-bar
                mode="determinate"
                [value]="getOrderProgress(order)"
                [color]="getProgressColor(order)">
              </mat-progress-bar>
            </div>

            <div class="preparation-items">
              <div class="item-row" *ngFor="let item of getPreparationItems(order)">
                <mat-icon [class.completed]="item.completed">
                  {{ item.completed ? 'check_circle' : 'radio_button_unchecked' }}
                </mat-icon>
                <span [class.completed]="item.completed">{{ item.name }}</span>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button color="primary" (click)="startPreparation(order)"
                    *ngIf="order.status === 'pending'">
              <mat-icon>play_arrow</mat-icon>
              Iniciar
            </button>
            <button mat-button color="accent" (click)="continuePreparation(order)"
                    *ngIf="order.status === 'in-progress'">
              <mat-icon>edit</mat-icon>
              Continuar
            </button>
            <button mat-button (click)="viewDetails(order)">
              <mat-icon>visibility</mat-icon>
              Detalles
            </button>
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="markComplete(order)">
                <mat-icon>check</mat-icon>
                <span>Marcar como completado</span>
              </button>
              <button mat-menu-item (click)="reportIssue(order)">
                <mat-icon>report</mat-icon>
                <span>Reportar incidencia</span>
              </button>
            </mat-menu>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="filteredOrders.length === 0">
        <mat-icon>inventory</mat-icon>
        <h2>No hay órdenes para mostrar</h2>
        <p>Ajusta los filtros o espera nuevas órdenes de preparación.</p>
      </div>

      <!-- FAB for mobile -->
      <button mat-fab color="primary" class="mobile-fab mobile-only">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .preparacion-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header h1 {
      margin: 0;
      font-weight: 300;
      color: #333;
    }

    .header-stats {
      display: flex;
      gap: 24px;
    }

    .stat {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 1.8rem;
      font-weight: 300;
      color: #1976d2;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .order-card {
      transition: transform 0.2s, box-shadow 0.2s;
      border-left: 4px solid #ddd;
    }

    .order-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .order-card.completed {
      border-left-color: #388e3c;
    }

    .order-card.in-progress {
      border-left-color: #ff9800;
    }

    .order-card.pending {
      border-left-color: #9e9e9e;
    }

    .order-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .order-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #666;
    }

    .detail-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
    }

    .progress-section {
      margin-bottom: 16px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #666;
    }

    .progress-percentage {
      font-weight: 500;
      color: #333;
    }

    .preparation-items {
      max-height: 120px;
      overflow-y: auto;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 0.9rem;
    }

    .item-row mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .item-row mat-icon.completed {
      color: #388e3c;
    }

    .item-row span.completed {
      text-decoration: line-through;
      color: #999;
    }

    .status-pending {
      background-color: #f5f5f5;
      color: #666;
    }

    .status-in-progress {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .status-completed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 16px;
      color: #ccc;
    }

    .empty-state h2 {
      margin: 16px 0 8px 0;
      font-weight: 300;
    }

    @media (max-width: 768px) {
      .orders-grid {
        grid-template-columns: 1fr;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-stats {
        width: 100%;
        justify-content: space-between;
      }

      .filters-form {
        flex-direction: column;
        width: 100%;
      }

      .filters-form mat-form-field {
        width: 100%;
      }
    }
  `]
})
export class PreparationComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  filterForm: FormGroup;

  completedOrders = 0;
  pendingOrders = 0;
  overallProgress = 0;

  constructor(
    private dataService: DataService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  ngOnInit(): void {
    this.dataService.getOrders().subscribe(orders => {
      this.orders = orders;
      this.filteredOrders = orders;
      this.updateStats();
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    this.filteredOrders = this.orders.filter(order => {
      let match = true;

      if (filters.status) {
        match = match && order.status === filters.status;
      }

      if (filters.dateFrom) {
        match = match && new Date(order.date) >= new Date(filters.dateFrom);
      }

      if (filters.dateTo) {
        match = match && new Date(order.date) <= new Date(filters.dateTo);
      }

      return match;
    });

    this.updateStats();
  }

  private updateStats(): void {
    this.completedOrders = this.filteredOrders.filter(o => o.status === 'completed').length;
    this.pendingOrders = this.filteredOrders.filter(o => o.status === 'pending').length;

    if (this.filteredOrders.length > 0) {
      const totalProgress = this.filteredOrders.reduce((sum, order) => sum + this.getOrderProgress(order), 0);
      this.overallProgress = Math.round(totalProgress / this.filteredOrders.length);
    } else {
      this.overallProgress = 0;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'in-progress': return 'sync';
      case 'pending': return 'schedule';
      default: return 'help_outline';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En Proceso';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  }

  getOrderProgress(order: Order): number {
    switch (order.status) {
      case 'completed': return 100;
      case 'in-progress': return Math.floor(Math.random() * 80) + 10;
      case 'pending': return 0;
      default: return 0;
    }
  }

  getProgressColor(order: Order): string {
    const progress = this.getOrderProgress(order);
    if (progress === 100) return 'primary';
    if (progress > 50) return 'accent';
    return 'warn';
  }

  getPreparationItems(order: Order): any[] {
    const items = [
      'Verificar inventario',
      'Recoger productos',
      'Empacar orden',
      'Etiquetar paquetes',
      'Documentación'
    ];

    const progress = this.getOrderProgress(order);
    const completedCount = Math.floor((progress / 100) * items.length);

    return items.map((item, index) => ({
      name: item,
      completed: index < completedCount
    }));
  }

  startPreparation(order: Order): void {
    console.log('Starting preparation for:', order.id);
    // TODO: Implement start preparation logic
  }

  continuePreparation(order: Order): void {
    console.log('Continuing preparation for:', order.id);
    // TODO: Implement continue preparation logic
  }

  viewDetails(order: Order): void {
    console.log('Viewing details for:', order.id);
    // TODO: Implement view details logic
  }

  markComplete(order: Order): void {
    console.log('Marking complete:', order.id);
    // TODO: Implement mark complete logic
  }

  reportIssue(order: Order): void {
    console.log('Reporting issue for:', order.id);
    // TODO: Implement report issue logic
  }
}
