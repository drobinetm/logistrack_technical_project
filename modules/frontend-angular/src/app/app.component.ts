import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, RouterModule } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatProgressBarModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false">
        
        <div class="sidenav-header">
          <h2 class="logo">
            <mat-icon>local_shipping</mat-icon>
            LogisTrack
          </h2>
        </div>
        
        <mat-nav-list>
          <a mat-list-item 
             *ngFor="let item of menuItems" 
             [routerLink]="item.route"
             [class.active]="activeRoute === item.route"
             (click)="closeDrawerOnMobile()">
            <mat-icon matListIcon>{{ item.icon }}</mat-icon>
            <span>{{ item.name }}</span>
            <mat-icon 
              *ngIf="item.badge" 
              class="badge-icon" 
              [matBadge]="item.badge" 
              matBadgeColor="warn">
              notifications
            </mat-icon>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          
          <span class="toolbar-title">{{ getPageTitle() }}</span>
          
          <div class="toolbar-spacer"></div>
        </mat-toolbar>
        
        <div class="content-container">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 280px;
      background: #ffffff;
      border-right: 1px solid #e0e0e0;
    }

    .sidenav-header {
      padding: 20px;
      background: linear-gradient(135deg, #1976d2, #1565c0);
      color: white;
      margin-bottom: 16px;
    }

    .logo {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 300;
      font-size: 1.5rem;
    }

    .logo mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-title {
      font-weight: 400;
      font-size: 1.25rem;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .content-container {
      padding: 24px;
      background: #f5f5f5;
      min-height: calc(100vh - 64px);
    }

    .mat-mdc-list-item.active {
      background-color: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .mat-mdc-list-item.active .mat-icon {
      color: #1976d2;
    }

    .badge-icon {
      margin-left: auto;
    }

    @media (max-width: 768px) {
      .content-container {
        padding: 16px;
      }
    }
  `]
})
export class AppComponent {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  activeRoute = '/dashboard';
  
  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { name: 'Dispatch', icon: 'send', route: '/dispatch', badge: 5 },
    { name: 'Preparation', icon: 'inventory', route: '/preparation', badge: 12 },
    { name: 'Shipping', icon: 'local_shipping', route: '/shipping' },
    { name: 'Receiving', icon: 'inbox', route: '/receiving', badge: 3 },
    { name: 'Consolidation', icon: 'view_kanban', route: '/consolidation' },
    { name: 'Distribution', icon: 'map', route: '/distribution', badge: 8 }
  ];

  isHandset$: Observable<boolean>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeRoute = event.urlAfterRedirects;
      }
    });

    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  getPageTitle(): string {
    const item = this.menuItems.find(item => item.route === this.activeRoute);
    return item ? item.name : 'LogisTrack';
  }

  closeDrawerOnMobile(): void {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset) {
        this.drawer.close();
      }
    });
  }
}