import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';

import { DashboardService } from '../../services/dashboard.service';
import { DashboardOrder, KPI, MapMarker } from '../../interfaces/dashboard.interface';
import { MapComponent } from '../../shared/map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  providers: [{ provide: 'BASE_API_URL', useValue: 'http://localhost:8000/api' }],
  imports: [CommonModule, MatCardModule, MatIconModule, MatGridListModule, MatProgressSpinnerModule, MapComponent],
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public kpis: KPI[] = [];
  public orders: DashboardOrder[] = [];
  public mapMarkers: MapMarker[] = [];
  public isLoading = true;
  public error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  public ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Loads dashboard data from the API
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService
      .getDashboardData()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.orders = data.orders;
          this.kpis = this.dashboardService.getKPIs(data.orders);
          this.mapMarkers = this.dashboardService.getMapMarkers(data.orders);
        },
        error: (err) => {
          console.error('Error loading dashboard data:', err);
          this.error = 'Error al cargar los datos del dashboard. Por favor, intente nuevamente.';
        },
      });
  }

  /**
   * Reloads the dashboard data
   */
  public reloadData(): void {
    this.loadDashboardData();
  }
}
