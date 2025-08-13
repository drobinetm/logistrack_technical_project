import { Component, OnInit, ViewChild } from '@angular/core';
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
import { DataService, Order } from '../../services/data.service';
import { MapComponent } from '../../shared/map.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface DeliveryOrder extends Order {
  deliveryDate?: Date;
  confirmationPhoto?: boolean;
  customerSignature?: boolean;
  deliveryNotes?: string;
  attemptCount?: number;
  lastAttempt?: Date;
}

@Component({
  selector: 'app-distribution',
  standalone: true,
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
    MapComponent,
    MatProgressBarModule
  ],
  template: `
    <div class="distribucion-container">
      <div class="header">
        <h1>Distribution and Deliveries</h1>
        <div class="header-stats">
          <mat-chip color="primary" class="stat-chip">
            <mat-icon>local_shipping</mat-icon>
            {{ getTotalDeliveries() }} Total
          </mat-chip>
          <mat-chip color="accent" class="stat-chip">
            <mat-icon>check_circle</mat-icon>
            {{ getDeliveredCount() }} Delivered
          </mat-chip>
          <mat-chip color="warn" class="stat-chip" [matBadge]="getRejectedCount()" matBadgeColor="warn">
            <mat-icon>cancel</mat-icon>
            Rechazadas
          </mat-chip>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <mat-card class="summary-card delivered">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon>check_circle</mat-icon>
              <div>
                <div class="summary-number">{{ getDeliveredCount() }}</div>
                <div class="summary-label">Entregadas</div>
                <div class="summary-percentage">{{ getDeliveredPercentage() }}%</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card pending">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon>schedule</mat-icon>
              <div>
                <div class="summary-number">{{ getPendingCount() }}</div>
                <div class="summary-label">Pendientes</div>
                <div class="summary-percentage">{{ getPendingPercentage() }}%</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card rejected">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon>cancel</mat-icon>
              <div>
                <div class="summary-number">{{ getRejectedCount() }}</div>
                <div class="summary-label">Rechazadas</div>
                <div class="summary-percentage">{{ getRejectedPercentage() }}%</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card in-transit">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon>local_shipping</mat-icon>
              <div>
                <div class="summary-number">{{ getInTransitCount() }}</div>
                <div class="summary-label">En Tránsito</div>
                <div class="summary-percentage">{{ getInTransitPercentage() }}%</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Content Tabs -->
      <mat-card class="main-card">
        <mat-tab-group>
          <!-- Deliveries List -->
          <mat-tab label="Lista de Entregas">
            <div class="tab-content">
              <!-- Filters -->
              <mat-card class="filters-card">
                <mat-card-content>
                  <form [formGroup]="filterForm" class="filters-form">
                    <mat-form-field appearance="outline">
                      <mat-label>Buscar</mat-label>
                      <input matInput placeholder="ID, destino, chofer..." formControlName="search">
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Estado</mat-label>
                      <mat-select formControlName="status">
                        <mat-option value="">Todos</mat-option>
                        <mat-option value="completed">Entregada</mat-option>
                        <mat-option value="pending">Pendiente</mat-option>
                        <mat-option value="in-progress">En Tránsito</mat-option>
                        <mat-option value="error">Rechazada</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Chofer</mat-label>
                      <mat-select formControlName="driver">
                        <mat-option value="">Todos</mat-option>
                        <mat-option *ngFor="let driver of getDrivers()" [value]="driver">
                          {{ driver }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Fecha desde</mat-label>
                      <input matInput [matDatepicker]="picker1" formControlName="dateFrom">
                      <mat-datepicker-toggle matSuffix [for]="picker1"></mat-datepicker-toggle>
                      <mat-datepicker #picker1></mat-datepicker>
                    </mat-form-field>

                    <button mat-raised-button color="primary" (click)="applyFilters()">
                      <mat-icon>filter_list</mat-icon>
                      Aplicar
                    </button>
                  </form>
                </mat-card-content>
              </mat-card>

              <!-- Deliveries Table -->
              <div class="table-container">
                <table mat-table [dataSource]="dataSource" matSort>
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                    <td mat-cell *matCellDef="let element">
                      <span class="order-id">{{ element.id }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="destination">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Destino</th>
                    <td mat-cell *matCellDef="let element">{{ element.destination }}</td>
                  </ng-container>

                  <ng-container matColumnDef="driver">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Chofer</th>
                    <td mat-cell *matCellDef="let element">
                      <div class="driver-info">
                        <mat-icon>person</mat-icon>
                        {{ element.driver }}
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="deliveryDate">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha Entrega</th>
                    <td mat-cell *matCellDef="let element">
                      {{ element.deliveryDate || element.date | date:'dd/MM/yyyy HH:mm' }}
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

                  <ng-container matColumnDef="confirmation">
                    <th mat-header-cell *matHeaderCellDef>Confirmación</th>
                    <td mat-cell *matCellDef="let element">
                      <div class="confirmation-icons">
                        <mat-icon
                          [class.confirmed]="element.customerSignature"
                          [class.pending]="!element.customerSignature"
                          matTooltip="Firma del cliente">
                          edit
                        </mat-icon>
                        <mat-icon
                          [class.confirmed]="element.confirmationPhoto"
                          [class.pending]="!element.confirmationPhoto"
                          matTooltip="Foto de confirmación">
                          photo_camera
                        </mat-icon>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="attempts">
                    <th mat-header-cell *matHeaderCellDef>Intentos</th>
                    <td mat-cell *matCellDef="let element">
                      <mat-chip
                        [color]="getAttemptsColor(element.attemptCount || 1)"
                        class="attempts-chip">
                        {{ element.attemptCount || 1 }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let element">
                      <div class="actions-container">
                        <button mat-icon-button color="primary" (click)="viewDeliveryDetails(element)">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button color="accent" (click)="trackDelivery(element)">
                          <mat-icon>map</mat-icon>
                        </button>
                        <button mat-icon-button
                                *ngIf="element.status === 'pending'"
                                (click)="markDelivered(element)">
                          <mat-icon>check</mat-icon>
                        </button>
                        <button mat-icon-button
                                *ngIf="element.status === 'pending'"
                                color="warn"
                                (click)="markRejected(element)">
                          <mat-icon>cancel</mat-icon>
                        </button>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                      [class.delivered-row]="row.status === 'completed'"
                      [class.rejected-row]="row.status === 'error'">
                  </tr>
                </table>
              </div>

              <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
            </div>
          </mat-tab>

          <!-- Delivery Routes Map -->
          <mat-tab label="Rutas de Entrega">
            <div class="tab-content">
              <div class="map-controls">
                <mat-form-field appearance="outline">
                  <mat-label>Filtrar por chofer</mat-label>
                  <mat-select (selectionChange)="filterRoutesByDriver($event.value)">
                    <mat-option value="">Todos los choferes</mat-option>
                    <mat-option *ngFor="let driver of getDrivers()" [value]="driver">
                      {{ driver }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Estado de entrega</mat-label>
                  <mat-select (selectionChange)="filterRoutesByStatus($event.value)">
                    <mat-option value="">Todos los estados</mat-option>
                    <mat-option value="completed">Solo entregadas</mat-option>
                    <mat-option value="pending">Solo pendientes</mat-option>
                    <mat-option value="error">Solo rechazadas</mat-option>
                  </mat-select>
                </mat-form-field>

                <button mat-raised-button color="primary" (click)="refreshRoutes()">
                  <mat-icon>refresh</mat-icon>
                  Actualizar Rutas
                </button>

                <button mat-raised-button color="accent" (click)="optimizeRoutes()">
                  <mat-icon>route</mat-icon>
                  Optimizar Rutas
                </button>
              </div>

              <mat-card class="route-map-card">
                <mat-card-content>
                  <app-map
                    [markers]="routeMarkers"
                    [fullHeight]="true">
                  </app-map>
                </mat-card-content>
              </mat-card>

              <!-- Routes Legend -->
              <div class="routes-legend">
                <h3>Estados de Entrega</h3>
                <div class="legend-items">
                  <div class="legend-item">
                    <div class="legend-marker green"></div>
                    <span>Entregadas ({{ getDeliveredCount() }})</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-marker yellow"></div>
                    <span>Pendientes ({{ getPendingCount() }})</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-marker red"></div>
                    <span>Rechazadas ({{ getRejectedCount() }})</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-marker blue"></div>
                    <span>En Tránsito ({{ getInTransitCount() }})</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Driver Performance -->
          <mat-tab label="Rendimiento por Chofer">
            <div class="tab-content">
              <div class="drivers-grid">
                <mat-card *ngFor="let driver of getDriverPerformance()" class="driver-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>person</mat-icon>
                      {{ driver.name }}
                    </mat-card-title>
                    <mat-card-subtitle>
                      {{ driver.totalDeliveries }} entregas asignadas
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="driver-stats">
                      <div class="stat delivered">
                        <div class="stat-icon">
                          <mat-icon>check_circle</mat-icon>
                        </div>
                        <div class="stat-info">
                          <div class="stat-number">{{ driver.delivered }}</div>
                          <div class="stat-label">Entregadas</div>
                          <div class="stat-percentage">{{ driver.deliveryRate }}%</div>
                        </div>
                      </div>

                      <div class="stat pending">
                        <div class="stat-icon">
                          <mat-icon>schedule</mat-icon>
                        </div>
                        <div class="stat-info">
                          <div class="stat-number">{{ driver.pending }}</div>
                          <div class="stat-label">Pendientes</div>
                        </div>
                      </div>

                      <div class="stat rejected">
                        <div class="stat-icon">
                          <mat-icon>cancel</mat-icon>
                        </div>
                        <div class="stat-info">
                          <div class="stat-number">{{ driver.rejected }}</div>
                          <div class="stat-label">Rechazadas</div>
                        </div>
                      </div>
                    </div>

                    <div class="driver-performance-bar">
                      <div class="performance-label">
                        <span>Tasa de entrega exitosa</span>
                        <span class="performance-rate">{{ driver.deliveryRate }}%</span>
                      </div>
                      <mat-progress-bar
                        mode="determinate"
                        [value]="driver.deliveryRate"
                        [color]="getPerformanceColor(driver.deliveryRate)">
                      </mat-progress-bar>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-button color="primary" (click)="viewDriverRoute(driver.name)">
                      <mat-icon>map</mat-icon>
                      Ver Ruta
                    </button>
                    <button mat-button (click)="viewDriverHistory(driver.name)">
                      <mat-icon>history</mat-icon>
                      Historial
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>

      <!-- Mobile FAB -->
      <button mat-fab color="primary" class="mobile-fab mobile-only">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .distribucion-container {
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
      gap: 8px;
      flex-wrap: wrap;
    }

    .stat-chip {
      padding: 8px 12px;
    }

    .stat-chip mat-icon {
      margin-right: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      transition: transform 0.2s;
      border-left: 4px solid;
    }

    .summary-card:hover {
      transform: translateY(-2px);
    }

    .summary-card.delivered {
      border-left-color: #4caf50;
    }

    .summary-card.pending {
      border-left-color: #ff9800;
    }

    .summary-card.rejected {
      border-left-color: #f44336;
    }

    .summary-card.in-transit {
      border-left-color: #2196f3;
    }

    .summary-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .summary-content mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .summary-card.delivered mat-icon { color: #4caf50; }
    .summary-card.pending mat-icon { color: #ff9800; }
    .summary-card.rejected mat-icon { color: #f44336; }
    .summary-card.in-transit mat-icon { color: #2196f3; }

    .summary-number {
      font-size: 1.8rem;
      font-weight: 300;
      color: #333;
    }

    .summary-label {
      font-size: 0.9rem;
      color: #666;
    }

    .summary-percentage {
      font-size: 0.8rem;
      color: #999;
    }

    .main-card {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 24px 0;
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

    .table-container {
      overflow-x: auto;
      margin-bottom: 16px;
    }

    .mat-mdc-table {
      width: 100%;
      min-width: 1000px;
    }

    .mat-mdc-row {
      transition: background-color 0.2s;
    }

    .delivered-row {
      background-color: rgba(76, 175, 80, 0.05);
      border-left: 3px solid #4caf50;
    }

    .rejected-row {
      background-color: rgba(244, 67, 54, 0.05);
      border-left: 3px solid #f44336;
    }

    .order-id {
      font-weight: 500;
      color: #1976d2;
    }

    .driver-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .driver-info mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .confirmation-icons {
      display: flex;
      gap: 8px;
    }

    .confirmation-icons mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .confirmation-icons mat-icon.confirmed {
      color: #4caf50;
    }

    .confirmation-icons mat-icon.pending {
      color: #ccc;
    }

    .attempts-chip {
      font-size: 0.8rem;
      min-height: 24px;
    }

    .status-completed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-in-progress {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .status-error {
      background-color: #ffebee;
      color: #c62828;
    }

    .actions-container {
      display: flex;
      gap: 4px;
    }

    .map-controls {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: center;
      flex-wrap: wrap;
    }

    .route-map-card {
      margin-bottom: 24px;
    }

    .routes-legend {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .routes-legend h3 {
      margin: 0 0 12px 0;
      font-size: 1.1rem;
      color: #333;
    }

    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }

    .legend-marker {
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }

    .legend-marker.green { background-color: #4caf50; }
    .legend-marker.yellow { background-color: #ff9800; }
    .legend-marker.red { background-color: #f44336; }
    .legend-marker.blue { background-color: #2196f3; }

    .drivers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .driver-card {
      transition: transform 0.2s;
      border-left: 4px solid #2196f3;
    }

    .driver-card:hover {
      transform: translateY(-2px);
    }

    .driver-stats {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .stat.delivered { background: rgba(76, 175, 80, 0.1); }
    .stat.pending { background: rgba(255, 152, 0, 0.1); }
    .stat.rejected { background: rgba(244, 67, 54, 0.1); }

    .stat-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .stat.delivered .stat-icon mat-icon { color: #4caf50; }
    .stat.pending .stat-icon mat-icon { color: #ff9800; }
    .stat.rejected .stat-icon mat-icon { color: #f44336; }

    .stat-info {
      flex: 1;
    }

    .stat-number {
      font-size: 1.2rem;
      font-weight: 500;
      color: #333;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #666;
    }

    .stat-percentage {
      font-size: 0.8rem;
      color: #999;
    }

    .driver-performance-bar {
      margin-top: 16px;
    }

    .performance-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #666;
    }

    .performance-rate {
      font-weight: 500;
      color: #333;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }

      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .filters-form {
        grid-template-columns: 1fr;
      }

      .map-controls {
        flex-direction: column;
      }

      .drivers-grid {
        grid-template-columns: 1fr;
      }

      .legend-items {
        justify-content: center;
      }
    }
  `]
})
export class DistributionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'destination', 'driver', 'deliveryDate', 'status', 'confirmation', 'attempts', 'actions'];
  dataSource = new MatTableDataSource<DeliveryOrder>();
  filterForm: FormGroup;

  orders: DeliveryOrder[] = [];
  routeMarkers: any[] = [];

  constructor(
    private dataService: DataService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      driver: [''],
      dateFrom: ['']
    });
  }

  ngOnInit(): void {
    this.dataService.getOrders().subscribe(orders => {
      this.orders = orders.map(order => ({
        ...order,
        deliveryDate: new Date(order.date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        confirmationPhoto: Math.random() > 0.3,
        customerSignature: Math.random() > 0.4,
        deliveryNotes: Math.random() > 0.7 ? 'Entregado en recepción' : '',
        attemptCount: Math.floor(Math.random() * 3) + 1,
        lastAttempt: new Date()
      })) as DeliveryOrder[];

      this.dataSource.data = this.orders;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.updateRouteMarkers();
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  getTotalDeliveries(): number {
    return this.orders.length;
  }

  getDeliveredCount(): number {
    return this.orders.filter(o => o.status === 'completed').length;
  }

  getPendingCount(): number {
    return this.orders.filter(o => o.status === 'pending').length;
  }

  getRejectedCount(): number {
    return this.orders.filter(o => o.status === 'error').length;
  }

  getInTransitCount(): number {
    return this.orders.filter(o => o.status === 'in-progress').length;
  }

  getDeliveredPercentage(): number {
    return Math.round((this.getDeliveredCount() / this.getTotalDeliveries()) * 100);
  }

  getPendingPercentage(): number {
    return Math.round((this.getPendingCount() / this.getTotalDeliveries()) * 100);
  }

  getRejectedPercentage(): number {
    return Math.round((this.getRejectedCount() / this.getTotalDeliveries()) * 100);
  }

  getInTransitPercentage(): number {
    return Math.round((this.getInTransitCount() / this.getTotalDeliveries()) * 100);
  }

  getDrivers(): string[] {
    const drivers = new Set(this.orders.map(o => o.driver).filter(Boolean));
    return Array.from(drivers) as string[];
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'in-progress': return 'local_shipping';
      case 'pending': return 'schedule';
      case 'error': return 'cancel';
      default: return 'help_outline';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Entregada';
      case 'in-progress': return 'En Tránsito';
      case 'pending': return 'Pendiente';
      case 'error': return 'Rechazada';
      default: return 'Desconocido';
    }
  }

  getAttemptsColor(attempts: number): string {
    if (attempts <= 1) return 'primary';
    if (attempts <= 2) return 'accent';
    return 'warn';
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    let filteredOrders = this.orders.filter(order => {
      let match;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();

        match = match && (
          order.id.toLowerCase().includes(searchTerm) ||
          order.destination.toLowerCase().includes(searchTerm) ||
          (order.driver && order.driver.toLowerCase().includes(searchTerm))
        );
      }

      if (filters.status) {
        match = match && order.status === filters.status;
      }

      if (filters.driver) {
        match = match && order.driver === filters.driver;
      }

      if (filters.dateFrom) {
        match = match && new Date(order.deliveryDate || order.date) >= new Date(filters.dateFrom);
      }

      return match;
    });

    this.dataSource.data = filteredOrders;
  }

  viewDeliveryDetails(order: DeliveryOrder): void {
    console.log('Viewing delivery details:', order.id);
    // TODO: Open delivery details dialog
  }

  trackDelivery(order: DeliveryOrder): void {
    console.log('Tracking delivery:', order.id);
    // TODO: Show delivery tracking
  }

  markDelivered(order: DeliveryOrder): void {
    console.log('Marking as delivered:', order.id);
    // TODO: Mark delivery as completed
  }

  markRejected(order: DeliveryOrder): void {
    console.log('Marking as rejected:', order.id);
    // TODO: Mark delivery as rejected
  }

  filterRoutesByDriver(driver: string): void {
    this.updateRouteMarkers(driver);
  }

  filterRoutesByStatus(status: string): void {
    this.updateRouteMarkers(undefined, status);
  }

  refreshRoutes(): void {
    this.updateRouteMarkers();
  }

  optimizeRoutes(): void {
    console.log('Optimizing routes');
    // TODO: Implement route optimization
  }

  getDriverPerformance(): any[] {
    const drivers = this.getDrivers();

    return drivers.map(driver => {
      const driverOrders = this.orders.filter(o => o.driver === driver);
      const delivered = driverOrders.filter(o => o.status === 'completed').length;
      const pending = driverOrders.filter(o => o.status === 'pending').length;
      const rejected = driverOrders.filter(o => o.status === 'error').length;
      const deliveryRate = Math.round((delivered / driverOrders.length) * 100);

      return {
        name: driver,
        totalDeliveries: driverOrders.length,
        delivered,
        pending,
        rejected,
        deliveryRate
      };
    });
  }

  getPerformanceColor(rate: number): string {
    if (rate >= 80) return 'primary';
    if (rate >= 60) return 'accent';
    return 'warn';
  }

  viewDriverRoute(driver: string): void {
    this.filterRoutesByDriver(driver);
    // Switch to map tab programmatically if needed
  }

  viewDriverHistory(driver: string): void {
    console.log('Viewing driver history:', driver);
    // TODO: Show driver delivery history
  }

  private updateRouteMarkers(filterDriver?: string, filterStatus?: string): void {
    let ordersToShow = this.orders;

    if (filterDriver) {
      ordersToShow = ordersToShow.filter(o => o.driver === filterDriver);
    }

    if (filterStatus) {
      ordersToShow = ordersToShow.filter(o => o.status === filterStatus);
    }

    this.routeMarkers = ordersToShow.slice(0, 50).map(order => ({
      lat: order.lat || -33.4489 + (Math.random() - 0.5) * 0.1,
      lng: order.lng || -70.6693 + (Math.random() - 0.5) * 0.1,
      title: `${order.id} - ${order.driver}`,
      color: this.getMarkerColor(order.status),
      popup: `
        <b>${order.id}</b><br>
        Chofer: ${order.driver}<br>
        Destino: ${order.destination}<br>
        Estado: ${this.getStatusText(order.status)}<br>
        Intentos: ${order.attemptCount || 1}<br>
        Fecha: ${(order.deliveryDate || order.date).toLocaleString()}
      `
    }));
  }

  private getMarkerColor(status: string): string {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'in-progress': return 'blue';
      case 'error': return 'red';
      default: return 'blue';
    }
  }
}
