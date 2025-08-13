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
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataService, Order } from '../../services/data.service';
import { MapComponent } from '../../shared/map.component';

@Component({
  selector: 'app-receiving',
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
    MatBadgeModule,
    MatExpansionModule,
    MapComponent
  ],
  template: `
    <div class="recepcion-container">
      <div class="header">
        <h1>Order Receiving</h1>
        <div class="header-stats">
          <mat-chip color="primary" class="stat-chip">
            <mat-icon>inbox</mat-icon>
            {{ getTotalReceived() }} Received
          </mat-chip>
          <mat-chip color="warn" class="stat-chip" [matBadge]="getIncidents()" matBadgeColor="warn">
            <mat-icon>warning</mat-icon>
            Incidents
          </mat-chip>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <mat-card class="summary-card received">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon>check_circle</mat-icon>
              <div>
                <div class="summary-number">{{ getReceivedToday() }}</div>
                <div class="summary-label">Recibidas Hoy</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card pending">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon>schedule</mat-icon>
              <div>
                <div class="summary-number">{{ getPendingReception() }}</div>
                <div class="summary-label">Pendientes</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card issues">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon>error</mat-icon>
              <div>
                <div class="summary-number">{{ getWithIssues() }}</div>
                <div class="summary-label">Con Problemas</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card processing">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon>sync</mat-icon>
              <div>
                <div class="summary-number">{{ getProcessing() }}</div>
                <div class="summary-label">Procesando</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Buscar</mat-label>
              <input matInput placeholder="ID, origen..." formControlName="search">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select formControlName="status">
                <mat-option value="">Todos</mat-option>
                <mat-option value="completed">Recibida</mat-option>
                <mat-option value="in-progress">Procesando</mat-option>
                <mat-option value="pending">Pendiente</mat-option>
                <mat-option value="error">Con Incidencias</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Fecha desde</mat-label>
              <input matInput [matDatepicker]="picker1" formControlName="dateFrom">
              <mat-datepicker-toggle matSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>CD Receptor</mat-label>
              <mat-select formControlName="cd">
                <mat-option value="">Todos</mat-option>
                <mat-option value="CD Santiago">CD Santiago</mat-option>
                <mat-option value="CD Valparaíso">CD Valparaíso</mat-option>
                <mat-option value="CD Concepción">CD Concepción</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="applyFilters()">
              <mat-icon>filter_list</mat-icon>
              Aplicar
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Orders List -->
      <mat-card class="orders-card">
        <mat-card-header>
          <mat-card-title>Órdenes Recibidas</mat-card-title>
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

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha Recepción</th>
                <td mat-cell *matCellDef="let element">{{ element.date | date:'dd/MM/yyyy HH:mm' }}</td>
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

              <ng-container matColumnDef="incidents">
                <th mat-header-cell *matHeaderCellDef>Incidencias</th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip
                    *ngIf="element.incidents && element.incidents.length > 0"
                    color="warn"
                    [matBadge]="element.incidents.length">
                    <mat-icon>warning</mat-icon>
                    {{ element.incidents.length }}
                  </mat-chip>
                  <span *ngIf="!element.incidents || element.incidents.length === 0"
                        class="no-incidents">Sin incidencias</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="weight">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Peso</th>
                <td mat-cell *matCellDef="let element">{{ element.weight || 0 }} kg</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button color="primary" (click)="viewDetails(element)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="processOrder(element)"
                          *ngIf="element.status === 'pending'">
                    <mat-icon>play_arrow</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="reportIncident(element)">
                    <mat-icon>report</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  [class.error-row]="row.incidents && row.incidents.length > 0"
                  (click)="selectOrder(row)">
              </tr>
            </table>
          </div>
          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>

      <!-- Incidents Panel -->
      <mat-card class="incidents-card" *ngIf="ordersWithIncidents.length > 0">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>warning</mat-icon>
            Incidencias Activas
          </mat-card-title>
          <mat-card-subtitle>{{ ordersWithIncidents.length }} órdenes con problemas</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-accordion>
            <mat-expansion-panel *ngFor="let order of ordersWithIncidents" class="incident-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <span class="incident-order">{{ order.id }}</span>
                  <mat-chip color="warn" class="incident-count">
                    {{ order.incidents?.length || 0 }} incidencias
                  </mat-chip>
                </mat-panel-title>
                <mat-panel-description>
                  {{ order.origin }} → {{ order.destination }}
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="incident-details">
                <div *ngFor="let incident of order.incidents" class="incident-item">
                  <mat-icon color="warn">error</mat-icon>
                  <span class="incident-text">{{ incident }}</span>
                  <button mat-icon-button color="primary">
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>

                <div class="incident-actions">
                  <button mat-button color="primary">
                    <mat-icon>add</mat-icon>
                    Agregar Incidencia
                  </button>
                  <button mat-button color="accent">
                    <mat-icon>check</mat-icon>
                    Resolver Todas
                  </button>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </mat-card-content>
      </mat-card>

      <!-- Reception Map -->
      <mat-card class="map-card">
        <mat-card-header>
          <mat-card-title>Ubicaciones de Recepción</mat-card-title>
          <mat-card-subtitle>CDs receptores e incidencias</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <app-map
            [markers]="mapMarkers"
            [fullHeight]="true">
          </app-map>
        </mat-card-content>
      </mat-card>

      <!-- Mobile FAB -->
      <button mat-fab color="primary" class="mobile-fab mobile-only">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .recepcion-container {
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

    .summary-card.received {
      border-left-color: #4caf50;
    }

    .summary-card.pending {
      border-left-color: #ff9800;
    }

    .summary-card.issues {
      border-left-color: #f44336;
    }

    .summary-card.processing {
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

    .summary-card.received mat-icon { color: #4caf50; }
    .summary-card.pending mat-icon { color: #ff9800; }
    .summary-card.issues mat-icon { color: #f44336; }
    .summary-card.processing mat-icon { color: #2196f3; }

    .summary-number {
      font-size: 1.8rem;
      font-weight: 300;
      color: #333;
    }

    .summary-label {
      font-size: 0.9rem;
      color: #666;
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

    .orders-card {
      margin-bottom: 24px;
    }

    .table-container {
      overflow-x: auto;
      margin-bottom: 16px;
    }

    .mat-mdc-table {
      width: 100%;
      min-width: 800px;
    }

    .mat-mdc-row {
      transition: background-color 0.2s;
      cursor: pointer;
    }

    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }

    .error-row {
      background-color: rgba(244, 67, 54, 0.05);
      border-left: 3px solid #f44336;
    }

    .order-id {
      font-weight: 500;
      color: #1976d2;
    }

    .no-incidents {
      color: #4caf50;
      font-size: 0.9rem;
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

    .incidents-card {
      margin-bottom: 24px;
    }

    .incident-panel {
      margin-bottom: 8px;
      border-left: 3px solid #f44336;
    }

    .incident-order {
      font-weight: 500;
      color: #1976d2;
      margin-right: 16px;
    }

    .incident-count {
      font-size: 0.7rem;
    }

    .incident-details {
      padding-top: 16px;
    }

    .incident-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .incident-text {
      flex: 1;
      color: #666;
    }

    .incident-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .map-card {
      margin-bottom: 24px;
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

      .incident-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ReceivingComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'origin', 'date', 'status', 'incidents', 'weight', 'actions'];
  dataSource = new MatTableDataSource<Order>();
  filterForm: FormGroup;

  orders: Order[] = [];
  ordersWithIncidents: Order[] = [];
  mapMarkers: any[] = [];
  selectedOrder: Order | null = null;

  constructor(
    private dataService: DataService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      dateFrom: [''],
      cd: ['']
    });
  }

  ngOnInit(): void {
    this.dataService.getOrders().subscribe(orders => {
      this.orders = orders;
      this.dataSource.data = orders;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.ordersWithIncidents = orders.filter(o => o.incidents && o.incidents.length > 0);
      this.updateMapMarkers();
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    let filteredOrders = this.orders.filter(order => {
      let match = true;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        match = match && (
          order.id.toLowerCase().includes(searchTerm) ||
          order.origin.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.status) {
        match = match && order.status === filters.status;
      }

      if (filters.dateFrom) {
        match = match && new Date(order.date) >= new Date(filters.dateFrom);
      }

      if (filters.cd) {
        match = match && order.origin.includes(filters.cd);
      }

      return match;
    });

    this.dataSource.data = filteredOrders;
  }

  getTotalReceived(): number {
    return this.orders.filter(o => o.status === 'completed').length;
  }

  getIncidents(): number {
    return this.ordersWithIncidents.length;
  }

  getReceivedToday(): number {
    const today = new Date();
    return this.orders.filter(o =>
      o.status === 'completed' &&
      new Date(o.date).toDateString() === today.toDateString()
    ).length;
  }

  getPendingReception(): number {
    return this.orders.filter(o => o.status === 'pending').length;
  }

  getWithIssues(): number {
    return this.ordersWithIncidents.length;
  }

  getProcessing(): number {
    return this.orders.filter(o => o.status === 'in-progress').length;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'in-progress': return 'sync';
      case 'pending': return 'schedule';
      case 'error': return 'error';
      default: return 'help_outline';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Recibida';
      case 'in-progress': return 'Procesando';
      case 'pending': return 'Pendiente';
      case 'error': return 'Con Error';
      default: return 'Desconocido';
    }
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
    console.log('Selected order:', order);
  }

  viewDetails(order: Order): void {
    console.log('Viewing details for:', order.id);
    // TODO: Implement view details
  }

  processOrder(order: Order): void {
    console.log('Processing order:', order.id);
    // TODO: Implement process order
  }

  reportIncident(order: Order): void {
    console.log('Reporting incident for:', order.id);
    // TODO: Implement report incident
  }

  private updateMapMarkers(): void {
    // CD locations (mock data)
    const cdLocations = [
      { name: 'CD Santiago', lat: -33.4489, lng: -70.6693 },
      { name: 'CD Valparaíso', lat: -33.0458, lng: -71.6197 },
      { name: 'CD Concepción', lat: -36.8270, lng: -73.0508 }
    ];

    this.mapMarkers = [
      // CD markers
      ...cdLocations.map(cd => ({
        lat: cd.lat,
        lng: cd.lng,
        title: cd.name,
        color: 'blue',
        popup: `<b>${cd.name}</b><br>Centro de Distribución`
      })),
      // Incident markers
      ...this.ordersWithIncidents.slice(0, 10).map(order => ({
        lat: order.lat || -33.4489 + (Math.random() - 0.5) * 0.1,
        lng: order.lng || -70.6693 + (Math.random() - 0.5) * 0.1,
        title: `${order.id} - Incidencia`,
        color: 'red',
        popup: `
          <b>${order.id}</b><br>
          Origen: ${order.origin}<br>
          Incidencias: ${order.incidents?.length || 0}<br>
          ${order.incidents?.slice(0, 2).join('<br>') || ''}
        `
      }))
    ];
  }
}
