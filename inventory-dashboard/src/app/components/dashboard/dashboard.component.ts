import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject } from 'rxjs';

import { InventoryService } from '../../services/inventory.service';
import { LoggingService } from '../../services/logging.service';
import { Vehicle, VehicleFilter } from '../../models/vehicle.model';
import { InventoryListComponent } from '../inventory-list/inventory-list.component';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { AgingStockAlertComponent } from '../aging-stock-alert/aging-stock-alert.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    InventoryListComponent,
    FilterPanelComponent,
    AgingStockAlertComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  vehicles$ = new BehaviorSubject<Vehicle[]>([]);
  filteredVehicles$ = new BehaviorSubject<Vehicle[]>([]);
  agingStock$ = new BehaviorSubject<Vehicle[]>([]);
  isLoading = true;
  error: string | null = null;

  private currentFilter: VehicleFilter = {};

  constructor(
    private inventoryService: InventoryService,
    private logger: LoggingService
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.logger.info('Loading vehicle inventory');

    this.inventoryService.getVehicles().subscribe({
      next: (vehicles) => {
        this.logger.info(`Loaded ${vehicles.length} vehicles`);
        this.vehicles$.next(vehicles);
        this.applyFilter(this.currentFilter);
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('Error loading vehicles', error);
        this.error = 'Failed to load inventory. Please ensure the JSON server is running.';
        this.isLoading = false;
      }
    });
  }

  onFilterChange(filter: VehicleFilter): void {
    this.logger.info('Applying filter', filter);
    this.currentFilter = filter;
    this.applyFilter(filter);
  }

  private applyFilter(filter: VehicleFilter): void {
    const allVehicles = this.vehicles$.value;
    const filtered = this.inventoryService.filterVehicles(allVehicles, filter);
    const aging = this.inventoryService.getAgingStock(filtered);

    this.filteredVehicles$.next(filtered);
    this.agingStock$.next(aging);

    this.logger.debug(`Filter applied: ${filtered.length} vehicles match, ${aging.length} aging`);
  }

  onVehicleAction(vehicle: Vehicle): void {
    this.logger.info('Vehicle action triggered', { vehicleId: vehicle.id });
  }
}

