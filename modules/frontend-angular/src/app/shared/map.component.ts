import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  color?: 'red' | 'green' | 'yellow' | 'blue';
  popup?: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #mapContainer class="map-container" [class.full-map]="fullHeight"></div>
  `,
  styles: [`
    .map-container {
      height: 300px;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      z-index: 1;
    }
    .full-map {
      height: 500px;
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Input() markers: MapMarker[] = [];
  @Input() center: [number, number] = [-33.4489, -70.6693]; // Santiago
  @Input() zoom: number = 10;
  @Input() fullHeight: boolean = false;

  private map!: L.Map;
  private markerLayer!: L.LayerGroup;

  ngOnInit(): void {
    // Fix for default markers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.addMarkers();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView(this.center, this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);
  }

  private addMarkers(): void {
    this.markerLayer.clearLayers();

    this.markers.forEach(marker => {
      const icon = this.getIcon(marker.color);
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .bindPopup(marker.popup || marker.title);
      
      this.markerLayer.addLayer(leafletMarker);
    });

    if (this.markers.length > 1) {
      const group = new L.FeatureGroup(this.markerLayer.getLayers());
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  private getIcon(color: string = 'blue'): L.Icon {
    const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
    
    return L.icon({
      iconUrl: iconUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  updateMarkers(newMarkers: MapMarker[]): void {
    this.markers = newMarkers;
    if (this.map) {
      this.addMarkers();
    }
  }
}