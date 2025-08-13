import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
// import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes } from '@angular/router';

import { AppComponent } from './app/app.component';
import { DashboardComponent } from './app/modules/dashboard/dashboard.component';
import { DispatchComponent } from './app/modules/dispatch/dispatch.component';
import { PreparationComponent } from './app/modules/preparation/preparation.component';
import { ShippingComponent } from './app/modules/shipping/shipping.component';
import { ReceivingComponent } from './app/modules/receiving/receiving.component';
import { ConsolidationComponent } from './app/modules/consolidation/consolidation.component';
import { DistributionComponent } from './app/modules/distribution/distribution.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'dispatch', component: DispatchComponent },
  { path: 'preparation', component: PreparationComponent },
  { path: 'shipping', component: ShippingComponent },
  { path: 'receiving', component: ReceivingComponent },
  { path: 'consolidation', component: ConsolidationComponent },
  { path: 'distribution', component: DistributionComponent }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    importProvidersFrom(
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      MatToolbarModule,
      MatSidenavModule,
      MatListModule,
      MatIconModule,
      MatButtonModule,
      MatCardModule,
      MatTableModule,
      MatInputModule,
      MatSelectModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatPaginatorModule,
      MatSortModule,
      MatProgressBarModule,
      MatChipsModule,
      MatTabsModule,
      MatBadgeModule,
      MatDialogModule,
      MatSnackBarModule
    )
  ]
});