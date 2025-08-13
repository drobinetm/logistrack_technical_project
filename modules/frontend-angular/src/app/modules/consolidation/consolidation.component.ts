import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { DataService, Order } from '../../services/data.service';
import { MapComponent } from '../../shared/map.component';

interface BlockGroup {
  id: string;
  name: string;
  orders: Order[];
  color: string;
  driver?: string;
  capacity: number;
  weight: number;
  status: 'pending' | 'ready' | 'assigned';
}

@Component({
  selector: 'app-consolidation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatTabsModule,
    MatMenuModule,
    MatProgressBarModule,
    DragDropModule,
    MapComponent
  ],
  template: `
    <div class="consolidacion-container">
      <div class="header">
        <h1>Block Consolidation</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            New Block
          </button>
          <button mat-raised-button color="accent">
            <mat-icon>auto_fix_high</mat-icon>
            Auto-optimize
          </button>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="summary-grid">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon color="primary">view_module</mat-icon>
              <div>
                <div class="summary-number">{{ blockGroups.length }}</div>
                <div class="summary-label">Bloques Activos</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon color="accent">inventory_2</mat-icon>
              <div>
                <div class="summary-number">{{ getTotalOrders() }}</div>
                <div class="summary-label">Órdenes Consolidadas</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon style="color: #4caf50">check_circle</mat-icon>
              <div>
                <div class="summary-number">{{ getReadyBlocks() }}</div>
                <div class="summary-label">Bloques Listos</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon color="warn">local_shipping</mat-icon>
              <div>
                <div class="summary-number">{{ getAssignedDrivers() }}</div>
                <div class="summary-label">Choferes Asignados</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs -->
      <mat-card class="main-card">
        <mat-tab-group>
          <!-- Kanban View -->
          <mat-tab label="Vista Kanban">
            <div class="tab-content">
              <div class="kanban-toolbar">
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Filtrar por estado</mat-label>
                  <mat-select (selectionChange)="filterBlocks($event.value)">
                    <mat-option value="">Todos</mat-option>
                    <mat-option value="pending">Pendientes</mat-option>
                    <mat-option value="ready">Listos</mat-option>
                    <mat-option value="assigned">Asignados</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="kanban-legend">
                  <span class="legend-item">
                    <div class="legend-color pending"></div>
                    Pendiente
                  </span>
                  <span class="legend-item">
                    <div class="legend-color ready"></div>
                    Listo
                  </span>
                  <span class="legend-item">
                    <div class="legend-color assigned"></div>
                    Asignado
                  </span>
                </div>
              </div>

              <div class="kanban-container" cdkDropListGroup>
                <div *ngFor="let block of filteredBlocks"
                     class="kanban-column"
                     [class]="'block-' + block.status">

                  <!-- Block Header -->
                  <div class="kanban-header">
                    <div class="block-info">
                      <h3>{{ block.name }}</h3>
                      <mat-chip [class]="'status-' + block.status">
                        {{ getStatusText(block.status) }}
                      </mat-chip>
                    </div>

                    <button mat-icon-button [matMenuTriggerFor]="blockMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>

                    <mat-menu #blockMenu="matMenu">
                      <button mat-menu-item (click)="assignDriver(block)">
                        <mat-icon>person_add</mat-icon>
                        <span>Asignar Chofer</span>
                      </button>
                      <button mat-menu-item (click)="optimizeBlock(block)">
                        <mat-icon>auto_fix_high</mat-icon>
                        <span>Optimizar</span>
                      </button>
                      <button mat-menu-item (click)="deleteBlock(block)">
                        <mat-icon>delete</mat-icon>
                        <span>Eliminar</span>
                      </button>
                    </mat-menu>
                  </div>

                  <!-- Block Stats -->
                  <div class="block-stats">
                    <div class="stat">
                      <mat-icon>inventory</mat-icon>
                      <span>{{ block.orders.length }} órdenes</span>
                    </div>
                    <div class="stat">
                      <mat-icon>scale</mat-icon>
                      <span>{{ block.weight }} kg</span>
                    </div>
                    <div class="stat" *ngIf="block.driver">
                      <mat-icon>person</mat-icon>
                      <span>{{ block.driver }}</span>
                    </div>
                  </div>

                  <!-- Capacity Bar -->
                  <div class="capacity-section">
                    <div class="capacity-label">
                      <span>Capacidad</span>
                      <span>{{ getCapacityPercentage(block) }}%</span>
                    </div>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="getCapacityPercentage(block)"
                      [color]="getCapacityColor(block)">
                    </mat-progress-bar>
                  </div>

                  <!-- Orders List -->
                  <div class="orders-list"
                       cdkDropList
                       [cdkDropListData]="block.orders"
                       (cdkDropListDropped)="drop($event)">

                    <div *ngFor="let order of block.orders"
                         class="order-card"
                         cdkDrag>

                      <div class="order-header">
                        <span class="order-id">{{ order.id }}</span>
                        <mat-chip class="order-priority" color="accent" *ngIf="order.cdPyme === 'CD'">
                          CD
                        </mat-chip>
                      </div>

                      <div class="order-details">
                        <div class="detail-row">
                          <mat-icon>location_on</mat-icon>
                          <span>{{ order.destination }}</span>
                        </div>
                        <div class="detail-row">
                          <mat-icon>scale</mat-icon>
                          <span>{{ order.weight || 0 }} kg</span>
                        </div>
                        <div class="detail-row">
                          <mat-icon>schedule</mat-icon>
                          <span>{{ order.date | date:'dd/MM' }}</span>
                        </div>
                      </div>

                      <div class="order-actions">
                        <button mat-icon-button (click)="viewOrderDetails(order)">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="removeFromBlock(order, block)">
                          <mat-icon>close</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Add Order Button -->
                  <button mat-button class="add-order-btn" (click)="addOrderToBlock(block)">
                    <mat-icon>add</mat-icon>
                    Agregar Orden
                  </button>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Map View -->
          <mat-tab label="Mapa de Entregas">
            <div class="tab-content">
              <div class="map-controls">
                <mat-form-field appearance="outline">
                  <mat-label>Bloque</mat-label>
                  <mat-select (selectionChange)="filterMapByBlock($event.value)">
                    <mat-option value="">Todos los bloques</mat-option>
                    <mat-option *ngFor="let block of blockGroups" [value]="block.id">
                      {{ block.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Chofer</mat-label>
                  <mat-select (selectionChange)="filterMapByDriver($event.value)">
                    <mat-option value="">Todos los choferes</mat-option>
                    <mat-option *ngFor="let driver of getAssignedDriversList()" [value]="driver">
                      {{ driver }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <button mat-raised-button color="primary" (click)="optimizeRoutes()">
                  <mat-icon>route</mat-icon>
                  Optimizar Rutas
                </button>
              </div>

              <mat-card class="delivery-map-card">
                <mat-card-content>
                  <app-map
                    [markers]="deliveryMarkers"
                    [fullHeight]="true">
                  </app-map>
                </mat-card-content>
              </mat-card>

              <!-- Map Legend -->
              <div class="map-legend">
                <h3>Leyenda de Colores por Chofer</h3>
                <div class="legend-grid">
                  <div *ngFor="let driver of getAssignedDriversList(); let i = index" class="legend-driver">
                    <div class="legend-color" [style.background-color]="getDriverColor(i)"></div>
                    <span>{{ driver }}</span>
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
    .consolidacion-container {
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

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
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

    .kanban-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .filter-field {
      min-width: 200px;
    }

    .kanban-legend {
      display: flex;
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
      border-radius: 4px;
    }

    .legend-color.pending { background-color: #ff9800; }
    .legend-color.ready { background-color: #4caf50; }
    .legend-color.assigned { background-color: #2196f3; }

    .kanban-container {
      display: flex;
      gap: 24px;
      overflow-x: auto;
      padding-bottom: 16px;
      min-height: 600px;
    }

    .kanban-column {
      min-width: 350px;
      max-width: 350px;
      background: #ffffff;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border-top: 4px solid;
    }

    .block-pending {
      border-top-color: #ff9800;
    }

    .block-ready {
      border-top-color: #4caf50;
    }

    .block-assigned {
      border-top-color: #2196f3;
    }

    .kanban-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .block-info h3 {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      font-weight: 500;
      color: #333;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .status-ready {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-assigned {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .block-stats {
      margin-bottom: 16px;
      border-bottom: 1px solid #eee;
      padding-bottom: 16px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #666;
    }

    .stat mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .capacity-section {
      margin-bottom: 16px;
    }

    .capacity-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #666;
    }

    .orders-list {
      min-height: 200px;
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 16px;
    }

    .order-card {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      transition: all 0.2s;
      cursor: grab;
      border-left: 3px solid #ddd;
    }

    .order-card:hover {
      background: #f5f5f5;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .order-card.cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      transform: rotate(5deg);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .order-id {
      font-weight: 500;
      color: #1976d2;
    }

    .order-priority {
      font-size: 0.7rem;
    }

    .order-details {
      margin-bottom: 8px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      font-size: 0.85rem;
      color: #666;
    }

    .detail-row mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .order-actions {
      display: flex;
      justify-content: flex-end;
      gap: 4px;
    }

    .order-actions button {
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .order-actions mat-icon {
      font-size: 16px;
    }

    .add-order-btn {
      width: 100%;
      border: 2px dashed #ddd;
      color: #666;
      transition: all 0.2s;
    }

    .add-order-btn:hover {
      border-color: #1976d2;
      color: #1976d2;
      background-color: rgba(25, 118, 210, 0.05);
    }

    .map-controls {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: center;
      flex-wrap: wrap;
    }

    .delivery-map-card {
      margin-bottom: 24px;
    }

    .map-legend {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .map-legend h3 {
      margin: 0 0 12px 0;
      font-size: 1.1rem;
      color: #333;
    }

    .legend-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .legend-driver {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }

    .legend-driver .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .kanban-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .kanban-legend {
        justify-content: center;
      }

      .kanban-container {
        flex-direction: column;
      }

      .kanban-column {
        min-width: 100%;
        max-width: 100%;
      }

      .map-controls {
        flex-direction: column;
      }
    }
  `]
})
export class ConsolidationComponent implements OnInit {
  blockGroups: BlockGroup[] = [];
  filteredBlocks: BlockGroup[] = [];
  deliveryMarkers: any[] = [];

  private driverColors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getOrders().subscribe(orders => {
      this.generateBlockGroups(orders);
      this.filteredBlocks = [...this.blockGroups];
      this.updateDeliveryMarkers();
    });
  }

  private generateBlockGroups(orders: Order[]): void {
    const drivers = ['Juan Pérez', 'Ana García', 'Carlos López', 'María Rodríguez', 'Pedro Martínez'];
    const statuses: BlockGroup['status'][] = ['pending', 'ready', 'assigned'];

    // Create 6 block groups
    this.blockGroups = Array.from({ length: 6 }, (_, i) => {
      const blockOrders = orders.slice(i * 8, (i + 1) * 8);
      const status = statuses[i % 3];
      const driver = status === 'assigned' ? drivers[i % drivers.length] : undefined;

      return {
        id: `BLOCK-${String.fromCharCode(65 + i)}`,
        name: `Bloque ${String.fromCharCode(65 + i)}`,
        orders: blockOrders,
        color: this.driverColors[i % this.driverColors.length],
        driver,
        capacity: 1000, // kg
        weight: blockOrders.reduce((sum, order) => sum + (order.weight || 0), 0),
        status
      };
    });
  }

  getTotalOrders(): number {
    return this.blockGroups.reduce((sum, block) => sum + block.orders.length, 0);
  }

  getReadyBlocks(): number {
    return this.blockGroups.filter(block => block.status === 'ready').length;
  }

  getAssignedDrivers(): number {
    const drivers = new Set(this.blockGroups.filter(b => b.driver).map(b => b.driver));
    return drivers.size;
  }

  getAssignedDriversList(): string[] {
    const drivers = new Set(this.blockGroups.filter(b => b.driver).map(b => b.driver));
    return Array.from(drivers) as string[];
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'ready': return 'Listo';
      case 'assigned': return 'Asignado';
      default: return 'Desconocido';
    }
  }

  getCapacityPercentage(block: BlockGroup): number {
    return Math.round((block.weight / block.capacity) * 100);
  }

  getCapacityColor(block: BlockGroup): string {
    const percentage = this.getCapacityPercentage(block);
    if (percentage > 90) return 'warn';
    if (percentage > 70) return 'accent';
    return 'primary';
  }

  getDriverColor(index: number): string {
    return this.driverColors[index % this.driverColors.length];
  }

  filterBlocks(status: string): void {
    if (!status) {
      this.filteredBlocks = [...this.blockGroups];
    } else {
      this.filteredBlocks = this.blockGroups.filter(block => block.status === status);
    }
  }

  drop(event: CdkDragDrop<Order[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update weights when moving between blocks
      this.updateBlockWeights();
    }
  }

  private updateBlockWeights(): void {
    this.blockGroups.forEach(block => {
      block.weight = block.orders.reduce((sum, order) => sum + (order.weight || 0), 0);
    });
  }

  assignDriver(block: BlockGroup): void {
    console.log('Assigning driver to block:', block.id);
    // TODO: Open driver assignment dialog
  }

  optimizeBlock(block: BlockGroup): void {
    console.log('Optimizing block:', block.id);
    // TODO: Implement block optimization
  }

  deleteBlock(block: BlockGroup): void {
    console.log('Deleting block:', block.id);
    // TODO: Implement block deletion
  }

  addOrderToBlock(block: BlockGroup): void {
    console.log('Adding order to block:', block.id);
    // TODO: Open order selection dialog
  }

  viewOrderDetails(order: Order): void {
    console.log('Viewing order details:', order.id);
    // TODO: Open order details dialog
  }

  removeFromBlock(order: Order, block: BlockGroup): void {
    const index = block.orders.indexOf(order);
    if (index > -1) {
      block.orders.splice(index, 1);
      this.updateBlockWeights();
    }
  }

  filterMapByBlock(blockId: string): void {
    this.updateDeliveryMarkers(blockId);
  }

  filterMapByDriver(driver: string): void {
    this.updateDeliveryMarkers(undefined, driver);
  }

  optimizeRoutes(): void {
    console.log('Optimizing routes');
    // TODO: Implement route optimization
  }

  private updateDeliveryMarkers(filterBlockId?: string, filterDriver?: string): void {
    let blocksToShow = this.blockGroups;

    if (filterBlockId) {
      blocksToShow = blocksToShow.filter(b => b.id === filterBlockId);
    }

    if (filterDriver) {
      blocksToShow = blocksToShow.filter(b => b.driver === filterDriver);
    }

    this.deliveryMarkers = [];

    blocksToShow.forEach((block, blockIndex) => {
      const driverColor = this.getDriverColor(blockIndex);

      block.orders.forEach(order => {
        this.deliveryMarkers.push({
          lat: order.lat || -33.4489 + (Math.random() - 0.5) * 0.1,
          lng: order.lng || -70.6693 + (Math.random() - 0.5) * 0.1,
          title: `${order.id} - ${block.name}`,
          color: this.getMarkerColorByBlock(block.status),
          popup: `
            <b>${order.id}</b><br>
            Bloque: ${block.name}<br>
            Destino: ${order.destination}<br>
            Chofer: ${block.driver || 'Sin asignar'}<br>
            Peso: ${order.weight || 0} kg
          `
        });
      });
    });
  }

  private getMarkerColorByBlock(status: string): string {
    switch (status) {
      case 'assigned': return 'green';
      case 'ready': return 'blue';
      case 'pending': return 'yellow';
      default: return 'red';
    }
  }
}
