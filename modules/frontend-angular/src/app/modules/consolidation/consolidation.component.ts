import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BlockGroup, Order } from '../../interfaces/consolidation.interfaces';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ConsolidationService } from '../../services/consolidation.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-consolidation',
  standalone: true,
  templateUrl: './consolidation.component.html',
  providers: [{ provide: 'BASE_API_URL', useValue: 'http://localhost:8000/api' }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    MatDatepickerModule,
    MatNativeDateModule,
    DragDropModule,
  ],
  styleUrls: ['./consolidation.component.scss'],
})
export class ConsolidationComponent implements OnInit {
  blockGroups: BlockGroup[] = [];
  filteredBlocks: BlockGroup[] = [];
  deliveryMarkers: any[] = [];
  filterForm: FormGroup;

  private driverColors = [
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
  ];

  private consolidationService = inject(ConsolidationService);

  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      date: [''],
    });
  }

  ngOnInit(): void {
    this.loadConsolidationData();

    // Watch for filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  getTotalOrders(): number {
    return this.blockGroups.reduce((sum, block) => sum + block.orders.length, 0);
  }

  getReadyBlocks(): number {
    return this.blockGroups.filter((block) => block.status === 'ready').length;
  }

  getAssignedDrivers(): number {
    const drivers = new Set(this.blockGroups.filter((b) => b.driver).map((b) => b.driver));
    return drivers.size;
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

  applyFilters(): void {
    const { status, date } = this.filterForm.value;

    this.filteredBlocks = [...this.blockGroups];

    // Apply status filter
    if (status) {
      this.filteredBlocks = this.filteredBlocks.filter((block) => {
        if (status === 'inDispatch') {
          return block.inDispatch > 0;
        } else if (status === 'delivered') {
          return block.delivered > 0;
        } else {
          return block.status === status;
        }
      });
    }

    // Apply date filter if provided
    if (date) {
      const filterDate = new Date(date).toDateString();
      this.filteredBlocks = this.filteredBlocks.filter((block) => {
        return block.orders.some(
          (order) =>
            order.dispatchDate && new Date(order.dispatchDate).toDateString() === filterDate
        );
      });
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      status: '',
      date: '',
    });
    this.filteredBlocks = [...this.blockGroups];
  }

  drop(event: CdkDragDrop<BlockGroup['orders']>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // Update the block weights after transfer
    this.updateBlockWeights();
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDIENTE: 'Pendiente',
      APROBADO: 'Aprobado',
      EN_CAMINO: 'En camino',
      ENTREGADO: 'Entregado',
      RECHAZADO: 'Rechazado',
    };
    return statusMap[status] || status;
  }

  private updateDeliveryMarkers(filterBlockId?: string, filterDriver?: string): void {
    let blocksToShow = this.blockGroups;

    if (filterBlockId) {
      blocksToShow = blocksToShow.filter((block) => block.id === filterBlockId);
    }

    if (filterDriver) {
      blocksToShow = blocksToShow.filter((block) => block.driver === filterDriver);
    }

    this.deliveryMarkers = [];

    blocksToShow.forEach((block, _) => {
      block.orders.forEach((order) => {
        const orderAny = order as any;
        if (orderAny.latitude && orderAny.longitude) {
          this.deliveryMarkers.push({
            position: {
              lat: orderAny.latitude,
              lng: orderAny.longitude,
            },
            title: order.code,
            color: this.getStatusColor(order.status),
            popup: `Pedido: ${order.code}<br>Destino: ${order.destination}`,
          });
        }
      });
    });
  }

  private getStatusColor(status: string = ''): string {
    switch (status?.toLowerCase()) {
      case 'aprobado':
        return 'green';
      case 'en_camino':
      case 'en camino':
        return 'blue';
      case 'entregado':
        return 'purple';
      case 'pendiente':
        return 'yellow';
      default:
        return 'gray';
    }
  }

  private updateBlockWeights(): void {
    this.blockGroups.forEach((block) => {
      this.updateBlockWeight(block);
    });
  }

  private updateBlockWeight(block: BlockGroup): void {
    block.weight = block.orders.reduce((sum, order) => sum + (order.weight || 0), 0);
  }

  private loadConsolidationData(): void {
    this.isLoading = true;

    this.consolidationService
      .getOrders()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          try {
            // Check if the response is an array directly or has a data property
            const data = Array.isArray(response) ? response : response?.data || [];
            this.processApiResponse(data);
          } catch (error) {
            this.showError('Error al procesar la respuesta del servidor');
          }
        },
        error: (error) => {
          // Show error to user
          this.showError('Error loading consolidation data');
        },
      });
  }

  private processApiResponse(apiGroups: any[]): void {
    try {
      // Ensure apiGroups is an array
      if (!Array.isArray(apiGroups)) {
        apiGroups = [];
      }

      // Transform the API response to match our component's expected format
      this.blockGroups = apiGroups.map((block, index): BlockGroup => {
        try {
          // Ensure block.orders is an array
          const orders = Array.isArray(block.orders) ? block.orders : [];

          // Map the orders from the API to our Order interface
          const mappedOrders: Order[] = orders.map((order: any) => {
            // Convert products to the expected format if they exist
            const products = order.products || [];
            const mappedProducts = Array.isArray(products)
              ? products.map((p: any) => ({
                  id: p.id,
                  name: p.name || p.Name || '-',
                  sku: p.sku || p.Sku || '-',
                }))
              : [];

            return {
              id: order.id || `order-${Math.random().toString(36).substr(2, 9)}`,
              code: order.code || `ORD-${index + 1}`,
              origin: order.origin || 'Unknown Origin',
              destination: order.destination || 'Unknown Destination',
              status: order.status ? order.status.toLowerCase() : 'pending',
              cdPyme: 'CD',
              dispatchDate: order.dispatchDate ? new Date(order.dispatchDate) : new Date(),
              weight:
                typeof order.weight === 'number'
                  ? order.weight
                  : mappedProducts.reduce(
                      (sum: number, p: any) => sum + (p.weight || 0) * (p.quantity || 1),
                      0
                    ),
              volume:
                typeof order.volume === 'number'
                  ? order.volume
                  : mappedProducts.reduce(
                      (sum: number, p: any) => sum + (p.volume || 0) * (p.quantity || 1),
                      0
                    ),
              products: mappedProducts,
              user: order.user || 'Unknown User',
              driver: order.driver || null,
              latitude: order.latitude,
              longitude: order.longitude,
              deliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : undefined,
              createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
              updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
            };
          });

          // Handle driver information
          let driverName: string | undefined;
          if (block.driver) {
            driverName =
              typeof block.driver === 'string'
                ? block.driver
                : `${block.driver.firstName || ''} ${block.driver.lastName || ''}`.trim() ||
                  undefined;
          }

          // Create the block group with the mapped orders
          return {
            id: block.blockId?.toString() || `block-${index}`,
            name: block.blockName || `Block ${index + 1}`,
            orders: mappedOrders,
            color: this.driverColors[index % this.driverColors.length],
            driver: driverName,
            capacity: 1000,
            weight:
              typeof block.weight === 'number'
                ? block.weight
                : mappedOrders.reduce((sum, o) => sum + (o.weight || 0), 0),
            status: this.mapStatus(block),
            total: typeof block.total === 'number' ? block.total : mappedOrders.length,
            completed: typeof block.completed === 'number' ? block.completed : 0,
            pending: typeof block.pending === 'number' ? block.pending : 0,
            rejected: typeof block.rejected === 'number' ? block.rejected : 0,
            delivered: typeof block.delivered === 'number' ? block.delivered : 0,
            approved: typeof block.approved === 'number' ? block.approved : 0,
            inDispatch: typeof block.inDispatch === 'number' ? block.inDispatch : 0,
            readyToShip: typeof block.readyToShip === 'number' ? block.readyToShip : 0,
            readyToDeliver: typeof block.readyToDeliver === 'number' ? block.readyToDeliver : 0,
          };
        } catch (error) {
          this.showError(`Error al procesar el bloque ${block.id}`);

          return {
            id: `error-block-${index}`,
            name: `Error Block ${index + 1}`,
            orders: [],
            color: this.driverColors[index % this.driverColors.length],
            capacity: 0,
            weight: 0,
            status: 'pending',
            total: 0,
            completed: 0,
            pending: 0,
            rejected: 0,
            delivered: 0,
            approved: 0,
            inDispatch: 0,
            readyToShip: 0,
            readyToDeliver: 0,
          };
        }
      });

      // Update filtered blocks
      this.filteredBlocks = [...this.blockGroups];

      // Update delivery markers on the map
      this.updateDeliveryMarkers();
    } catch (error) {
      this.blockGroups = [];
      this.filteredBlocks = [];
      this.showError('Error al procesar los datos de consolidación');
    }
  }

  private showError(message: string, action: string = 'Cerrar', duration: number = 5000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: ['error-snackbar'],
    });
  }

  private mapStatus(block: any): 'pending' | 'ready' | 'assigned' {
    if (block.driver) {
      return 'assigned';
    } else if (block.orders && block.orders.length > 0) {
      return 'ready';
    }
    return 'pending';
  }
}
