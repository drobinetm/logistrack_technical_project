import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { DataService, KPI, Order } from '../../services/data.service';
import { MapComponent } from '../../shared/map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatGridListModule,
    MapComponent
  ],
  template: `
    <div class="dashboard-container">
      <h1>Panel de Control</h1>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <mat-card *ngFor="let kpi of kpis" class="kpi-card">
          <div class="kpi-content">
            <mat-icon [style.color]="kpi.color">{{ kpi.icon }}</mat-icon>
            <div class="kpi-number">{{ kpi.value }}</div>
            <div class="kpi-label">{{ kpi.label }}</div>
          </div>
        </mat-card>
      </div>

      <!-- Charts and Map Section -->
      <div class="dashboard-content">
        <div class="chart-section">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Estado de Entregas</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-placeholder">
                <div class="pie-chart">
                  <div class="pie-segment completed" [style.--percentage]="completedPercentage + '%'">
                    <span class="pie-label">{{ completedPercentage }}% Completadas</span>
                  </div>
                  <div class="pie-segment pending" [style.--percentage]="pendingPercentage + '%'">
                    <span class="pie-label">{{ pendingPercentage }}% Pendientes</span>
                  </div>
                  <div class="pie-segment error" [style.--percentage]="errorPercentage + '%'">
                    <span class="pie-label">{{ errorPercentage }}% Con Error</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="map-section">
          <mat-card class="map-card">
            <mat-card-header>
              <mat-card-title>Ubicaciones Activas</mat-card-title>
              <mat-card-subtitle>Distribución geográfica actual</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <app-map
                [markers]="mapMarkers"
                [center]="[-33.4489, -70.6693]"
                [zoom]="11">
              </app-map>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 24px 0;
      font-weight: 300;
      color: #333;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      text-align: center;
    }

    .kpi-content {
      padding: 16px;
    }

    .kpi-content mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      margin-bottom: 16px;
    }

    .kpi-number {
      font-size: 2.5rem;
      font-weight: 300;
      margin: 8px 0;
      color: #1976d2;
    }

    .kpi-label {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .chart-card, .map-card {
      height: 400px;
    }

    .chart-placeholder {
      height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pie-chart {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: conic-gradient(
        #388e3c 0deg 120deg,
        #ff9800 120deg 240deg,
        #d32f2f 240deg 360deg
      );
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .pie-chart::after {
      content: '';
      position: absolute;
      width: 100px;
      height: 100px;
      background: white;
      border-radius: 50%;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }

      .kpi-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  kpis: KPI[] = [];
  orders: Order[] = [];
  mapMarkers: any[] = [];

  completedPercentage = 45;
  pendingPercentage = 35;
  errorPercentage = 20;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.kpis = this.dataService.getKPIs();

    this.dataService.getOrders().subscribe(orders => {
      this.orders = orders;
      this.updateMapMarkers();
    });
  }

  private updateMapMarkers(): void {
    this.mapMarkers = this.orders
      .filter(order => order.lat && order.lng && order.status === 'in-progress')
      .slice(0, 10)
      .map(order => ({
        lat: order.lat!,
        lng: order.lng!,
        title: `${order.id} - ${order.destination}`,
        color: this.getMarkerColor(order.status),
        popup: `<b>${order.id}</b><br>Destino: ${order.destination}<br>Estado: ${order.status}`
      }));
  }

  private getMarkerColor(status: string): string {
    switch (status) {
      case 'completed': return 'green';
      case 'error': return 'red';
      case 'pending': return 'yellow';
      default: return 'blue';
    }
  }
}
