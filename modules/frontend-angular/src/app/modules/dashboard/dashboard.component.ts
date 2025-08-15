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
  templateUrl: './dashboard.component.html',
  providers: [{ provide: 'BASE_API_URL', useValue: 'http://localhost:8000/api' }],
  imports: [CommonModule, MatCardModule, MatIconModule, MatGridListModule, MapComponent],
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public kpis: KPI[] = [];
  public orders: Order[] = [];
  public mapMarkers: any[] = [];

  public completedPercentage = 45;
  public pendingPercentage = 35;
  public errorPercentage = 20;

  constructor(private dataService: DataService) {}

  public ngOnInit(): void {
    this.kpis = this.dataService.getKPIs();

    this.dataService.getOrders().subscribe((orders) => {
      this.orders = orders;
      this.updateMapMarkers();
    });
  }

  private updateMapMarkers(): void {
    this.mapMarkers = this.orders
      .filter((order) => order.lat && order.lng && order.status === 'in-progress')
      .slice(0, 10)
      .map((order) => ({
        lat: order.lat!,
        lng: order.lng!,
        title: `${order.id} - ${order.destination}`,
        color: this.getMarkerColor(order.status),
        popup: `<b>${order.id}</b><br>Destino: ${order.destination}<br>Estado: ${order.status}`,
      }));
  }

  private getMarkerColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'green';
      case 'error':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'blue';
    }
  }
}
