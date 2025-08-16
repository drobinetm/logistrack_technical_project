import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, RouterModule } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatProgressBarModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="!isCollapsed"
        [style.width.px]="isCollapsed ? '64' : '280'"
        [class.collapsed]="isCollapsed"
      >
        <div class="sidenav-header">
          <h2 class="logo" [class.collapsed]="isCollapsed">
            <mat-icon>local_shipping</mat-icon>
            <span class="logo-text">LogisTrack</span>
          </h2>
        </div>

        <mat-nav-list>
          <a
            mat-list-item
            *ngFor="let item of menuItems"
            [routerLink]="item.route"
            [class.active]="activeRoute === item.route"
          >
            <mat-icon matListIcon>{{ item.icon }}</mat-icon>
            <span>{{ item.name }}</span>
            <mat-icon
              *ngIf="item.badge"
              class="badge-icon"
              [matBadge]="item.badge"
              matBadgeColor="warn"
            >
              notifications
            </mat-icon>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <ng-container *ngIf="isHandset$ | async; else desktopToggle">
            <button mat-icon-button (click)="drawer.toggle()" aria-label="Toggle menu">
              <mat-icon>menu</mat-icon>
            </button>
          </ng-container>

          <ng-template #desktopToggle>
            <button
              mat-icon-button
              (click)="toggleMenu()"
              [matTooltip]="isCollapsed ? 'Show menu' : 'Hide menu'"
              aria-label="Toggle menu"
              class="menu-toggle"
            >
              <mat-icon>{{ isCollapsed ? 'menu' : 'menu_open' }}</mat-icon>
            </button>
          </ng-template>

          <span class="toolbar-title">{{ getPageTitle() }}</span>
          <div class="toolbar-spacer"></div>
        </mat-toolbar>

        <div class="content-container">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100vh;
        font-size: 1.05rem;
      }

      .sidenav {
        width: 280px;
        background: #ffffff;
        border-right: 1px solid #e0e0e0;
        font-family: var(--font-family, 'Roboto', sans-serif);
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition:
          width 0.2s ease,
          transform 0.2s ease;
        white-space: nowrap;

        &.collapsed {
          .logo-text,
          .mat-mdc-list-item span {
            opacity: 0;
            width: 0;
            margin: 0;
            overflow: hidden;
          }

          .mat-mdc-list-item {
            justify-content: center;
            padding: 8px 0;

            .mat-icon {
              margin: 0;
            }
          }

          .badge-icon {
            display: none;
          }
        }

        mat-nav-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 8px 0;
          transition: all 0.2s ease;
        }
      }

      .sidenav-header {
        padding: 16px;
        background: linear-gradient(135deg, #1a237e, #283593);
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 64px;
        transition: all 0.3s ease;

        h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 1.1rem;
          font-weight: 500;
          white-space: nowrap;

          .mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }
        }
      }

      .logo {
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-weight: 500;
        font-size: 1.5rem;
        letter-spacing: 0.3px;
        transition: all 0.2s ease;
        padding: 0 12px;

        .logo-text {
          transition:
            opacity 0.2s ease,
            width 0.2s ease;
          display: inline-block;
          overflow: hidden;
        }

        &.collapsed {
          justify-content: center;
        }
      }

      .logo mat-icon {
        font-size: 1.75rem;
        width: 1.75rem;
        height: 1.75rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .mat-mdc-list-item {
        padding: 4px 12px 4px 8px;
        margin: 2px 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        height: 40px;
        overflow: hidden;
        white-space: nowrap;
        line-height: 1.2;

        span {
          transition:
            opacity 0.2s ease,
            width 0.2s ease;
          display: inline-block;
          overflow: hidden;
          flex: 1;
        }
      }

      .mat-mdc-list-item:hover:not(.active) {
        background-color: #eceff1;
      }

      .mat-mdc-list-item .mat-icon {
        margin: 0 10px 0 0;
        font-size: 1.2rem;
        width: 22px;
        height: 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .mat-mdc-list-item span {
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.1px;
        line-height: 1.2;
        margin: 0;
        padding: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .toolbar {
        position: sticky;
        top: 0;
        z-index: 1;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 0 16px 0 8px;
        min-height: 64px;
        display: flex;
        align-items: center;
      }

      .toolbar-title {
        font-weight: 500;
        font-size: 1.3rem;
        letter-spacing: 0.2px;
        margin: 0 auto;
      }

      .menu-toggle {
        color: white;
        background: rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease;
        margin-right: 8px;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .mat-icon {
          color: white;
        }
      }

      .toolbar-spacer {
        flex: 1 1 auto;
      }

      .content-container {
        padding: 24px;
        background: #f8f9fa;
        min-height: calc(100vh - 64px);
      }

      .mat-mdc-list-item.active {
        background-color: rgba(25, 118, 210, 0.1);
        color: #1976d2;
        font-weight: 500;

        .mat-icon {
          color: #1976d2;
        }
      }

      .mat-mdc-button {
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .content-container {
          padding: 16px;
        }

        .sidenav {
          width: 260px;

          &.collapsed {
            width: 64px !important;
          }
        }

        .sidenav-header {
          padding: 16px 20px;
        }

        .logo {
          font-size: 1.3rem;
        }

        .toolbar-title {
          font-size: 1.1rem;
        }
      }
    `,
  ],
})
export class AppComponent {
  @ViewChild('drawer') public drawer!: MatSidenav;

  public isCollapsed = false;
  public activeRoute = '/dashboard';

  public menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { name: 'Recepción', icon: 'inventory_2', route: '/receiving' },
    { name: 'Preparación', icon: 'inventory', route: '/preparation' },
    { name: 'Despacho', icon: 'local_shipping', route: '/dispatch' },
    { name: 'Distribución', icon: 'delivery_dining', route: '/distribution' },
    { name: 'Consolidación', icon: 'merge', route: '/consolidation' },
  ];

  public isHandset$: Observable<boolean>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeRoute = event.urlAfterRedirects;
      }
    });

    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches),
      shareReplay()
    );
  }

  public getPageTitle(): string {
    const item = this.menuItems.find((item) => item.route === this.activeRoute);
    return item ? item.name : 'LogisTrack';
  }

  public closeDrawerOnMobile(): void {
    this.isHandset$.subscribe((isHandset) => {
      if (isHandset) {
        this.drawer.close();
      }
    });
  }

  public toggleMenu(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
