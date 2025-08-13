import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { DataService, Order } from '../../services/data.service';
import { MapComponent } from '../../shared/map.component';

interface ExpeditionOrder extends Order {
  carrier?: string;
  route?: string;
  estimatedTime?: string;
}

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [
    CommonModule,
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
    MapComponent
  ],
  template: `
    <div class="expedicion-container">
      <div class="header">
        <h1>Shipping and Transport</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Assign Route
          </button>
          <button mat-button>
            <mat-icon>download</mat-icon>
            Export
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon color="primary">local_shipping</mat-icon>
              <div>
                <div class="summary-number">{{ getTotalShipments() }}</div>
                <div class="summary-label">Total Shipments</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon color="accent">person</mat-icon>
              <div>
                <div class="summary-number">{{ getActiveDrivers() }}</div>
                <div class="summary-label">Choferes Activos</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon color="warn">schedule</mat-icon>
              <div>
                <div class="summary-number">{{ getPendingShipments() }}</div>
                <div class="summary-label">Pendientes</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon style="color: #4caf50">shopping_bag</mat-icon>
              <div>
                <div class="summary-number">{{ getTotalBags() }}</div>
                <div class="summary-label">Total Bolsas</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs for different views -->
      <mat-card class="main-card">
        <mat-tab-group>
          <!-- All Shipments Tab -->
          <mat-tab label="Todos los Envíos">
            <div class="tab-content">
              <div class="filters-section">
                <mat-form-field appearance="outline">
                  <mat-label>Buscar</mat-label>
                  <input matInput (keyup)="applyFilter($event, 'all')" placeholder="Chofer, destino...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Estado</mat-label>
                  <mat-select (selectionChange)="filterByStatus($event.value)">
                    <mat-option value="">Todos</mat-option>
                    <mat-option value="pending">Pendiente</mat-option>
                    <mat-option value="in-progress">En Ruta</mat-option>
                    <mat-option value="completed">Completado</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="table-container">
                <table mat-table [dataSource]="allShipmentsDataSource" matSort>
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                    <td mat-cell *matCellDef="let element">{{ element.id }}</td>
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

                  <ng-container matColumnDef="destination">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Destino</th>
                    <td mat-cell *matCellDef="let element">{{ element.destination }}</td>
                  </ng-container>

                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha</th>
                    <td mat-cell *matCellDef="let element">{{ element.date | date:'dd/MM/yyyy HH:mm' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="bags">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Bolsas</th>
                    <td mat-cell *matCellDef="let element">
                      <mat-chip color="primary">{{ element.bags || 0 }}</mat-chip>
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
                      <button mat-icon-button color="primary" (click)="trackRoute(element)">
                        <mat-icon>map</mat-icon>
                      </button>
                      <button mat-icon-button color="accent">
                        <mat-icon>edit</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>

              <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
            </div>
          </mat-tab>

          <!-- By Carrier Tab -->
          <mat-tab label="Por Transportista">
            <div class="tab-content">
              <div class="carriers-grid">
                <mat-card *ngFor="let carrier of getCarrierGroups()" class="carrier-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>business</mat-icon>
                      {{ carrier.name }}
                    </mat-card-title>
                    <mat-card-subtitle>
                      {{ carrier.orders.length }} envíos asignados
                    </mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="carrier-stats">
                      <div class="stat">
                        <span class="stat-value">{{ carrier.totalBags }}</span>
                        <span class="stat-label">Bolsas</span>
                      </div>
                      <div class="stat">
                        <span class="stat-value">{{ carrier.completed }}</span>
                        <span class="stat-label">Completados</span>
                      </div>
                      <div class="stat">
                        <span class="stat-value">{{ carrier.pending }}</span>
                        <span class="stat-label">Pendientes</span>
                      </div>
                    </div>

                    <div class="carrier-orders">
                      <div *ngFor="let order of carrier.orders.slice(0, 3)" class="carrier-order">
                        <span class="order-id">{{ order.id }}</span>
                        <span class="order-destination">{{ order.destination }}</span>
                        <mat-chip [class]="'status-' + order.status" class="order-status">
                          {{ getStatusText(order.status) }}
                        </mat-chip>
                      </div>
                      <div *ngIf="carrier.orders.length > 3" class="more-orders">
                        +{{ carrier.orders.length - 3 }} más
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-button color="primary">
                      <mat-icon>visibility</mat-icon>
                      Ver Todos
                    </button>
                    <button mat-button>
                      <mat-icon>map</mat-icon>
                      Rutas
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Routes Map Tab -->
          <mat-tab label="Mapa de Rutas">
            <div class="tab-content">
              <div class="map-controls">
                <mat-form-field appearance="outline">
                  <mat-label>Filtrar por chofer</mat-label>
                  <mat-select (selectionChange)="filterMapByDriver($event.value)">
                    <mat-option value="">Todos los choferes</mat-option>
                    <mat-option *ngFor="let driver of getDrivers()" [value]="driver">
                      {{ driver }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <button mat-raised-button color="primary" (click)="refreshRoutes()">
                  <mat-icon>refresh</mat-icon>
                  Actualizar Rutas
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

              <div class="route-legend">
                <h3>Leyenda</h3>
                <div class="legend-items">
                  <div class="legend-item">
                    <div class="legend-color blue"></div>
                    <span>Ruta estimada</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color green"></div>
                    <span>Entregado</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color yellow"></div>
                    <span>En tránsito</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color red"></div>
                    <span>Con retraso</span>
                  </div>
                </div>
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
    .expedicion-container {
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

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      min-height: 100px;
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

    .summary-number {
      font-size: 1.8rem;
      font-weight: 300;
      color: #333;
    }

    .summary-label {
      font-size: 0.9rem;
      color: #666;
    }

    .main-card {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .filters-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .table-container {
      overflow-x: auto;
      margin-bottom: 16px;
    }

    .mat-mdc-table {
      width: 100%;
      min-width: 800px;
    }

    .driver-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .driver-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .status-in-progress {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-completed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .carriers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .carrier-card {
      border-left: 4px solid #1976d2;
    }

    .carrier-stats {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 300;
      color: #1976d2;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #666;
      text-transform: uppercase;
    }

    .carrier-orders {
      border-top: 1px solid #eee;
      padding-top: 16px;
    }

    .carrier-order {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .order-id {
      font-weight: 500;
      color: #1976d2;
    }

    .order-destination {
      flex: 1;
      margin: 0 8px;
      color: #666;
    }

    .order-status {
      font-size: 0.7rem;
    }

    .more-orders {
      text-align: center;
      color: #666;
      font-size: 0.9rem;
      margin-top: 8px;
    }

    .map-controls {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: center;
    }

    .route-map-card {
      margin-bottom: 24px;
    }

    .route-legend {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .route-legend h3 {
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

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }

    .legend-color.blue { background-color: #2196f3; }
    .legend-color.green { background-color: #4caf50; }
    .legend-color.yellow { background-color: #ff9800; }
    .legend-color.red { background-color: #f44336; }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        justify-content: space-between;
      }

      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }

      .carriers-grid {
        grid-template-columns: 1fr;
      }

      .filters-section {
        flex-direction: column;
      }

      .map-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .legend-items {
        justify-content: center;
      }
    }
  `]
})
export class ShippingComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'driver', 'destination', 'date', 'bags', 'status', 'actions'];
  allShipmentsDataSource = new MatTableDataSource<ExpeditionOrder>();

  orders: ExpeditionOrder[] = [];
  routeMarkers: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getOrders().subscribe(orders => {
      this.orders = orders.map(order => ({
        ...order,
        carrier: this.getRandomCarrier(),
        route: this.getRandomRoute(),
        estimatedTime: this.getEstimatedTime()
      }));

      this.allShipmentsDataSource.data = this.orders;
      this.allShipmentsDataSource.paginator = this.paginator;
      this.allShipmentsDataSource.sort = this.sort;
      this.updateRouteMarkers();
    });
  }

  private getRandomCarrier(): string {
    const carriers = ['TransChile', 'LogisExpress', 'RapidoCargo', 'ChileDelivery', 'TransAndes'];
    return carriers[Math.floor(Math.random() * carriers.length)];
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
    const drivers = new Set(this.orders.map(o => o.driver));
    return drivers.size;
  }

  getPendingShipments(): number {
    return this.orders.filter(o => o.status === 'pending').length;
  }

  getTotalBags(): number {
    return this.orders.reduce((total, order) => total + (order.bags || 0), 0);
  }

  getCarrierGroups(): any[] {
    const grouped = this.orders.reduce((groups: any, order) => {
      const carrier = order.carrier || 'Sin asignar';
      if (!groups[carrier]) {
        groups[carrier] = [];
      }
      groups[carrier].push(order);
      return groups;
    }, {});

    return Object.keys(grouped).map(name => ({
      name,
      orders: grouped[name],
      totalBags: grouped[name].reduce((sum: number, o: any) => sum + (o.bags || 0), 0),
      completed: grouped[name].filter((o: any) => o.status === 'completed').length,
      pending: grouped[name].filter((o: any) => o.status === 'pending').length
    }));
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
      default: return 'help_outline';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En Ruta';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  }

  applyFilter(event: Event, tab: string): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.allShipmentsDataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByStatus(status: string): void {
    if (!status) {
      this.allShipmentsDataSource.data = this.orders;
    } else {
      this.allShipmentsDataSource.data = this.orders.filter(order => order.status === status);
    }
  }

  filterMapByDriver(driver: string): void {
    if (!driver) {
      this.updateRouteMarkers();
    } else {
      this.updateRouteMarkers(driver);
    }
  }

  trackRoute(order: ExpeditionOrder): void {
    console.log('Tracking route for:', order.id);
    // TODO: Implement route tracking
  }

  refreshRoutes(): void {
    this.updateRouteMarkers();
  }

  private updateRouteMarkers(filterDriver?: string): void {
    const ordersToShow = filterDriver
      ? this.orders.filter(o => o.driver === filterDriver)
      : this.orders.filter(o => o.status === 'in-progress').slice(0, 15);

    this.routeMarkers = ordersToShow.map(order => ({
      lat: order.lat || -33.4489 + (Math.random() - 0.5) * 0.1,
      lng: order.lng || -70.6693 + (Math.random() - 0.5) * 0.1,
      title: `${order.id} - ${order.driver}`,
      color: this.getRouteMarkerColor(order.status),
      popup: `
        <b>${order.id}</b><br>
        Chofer: ${order.driver}<br>
        Destino: ${order.destination}<br>
        Estado: ${this.getStatusText(order.status)}<br>
        Bolsas: ${order.bags || 0}
      `
    }));
  }

  private getRouteMarkerColor(status: string): string {
    switch (status) {
      case 'completed': return 'green';
      case 'in-progress': return 'blue';
      case 'pending': return 'yellow';
      default: return 'red';
    }
  }
}
