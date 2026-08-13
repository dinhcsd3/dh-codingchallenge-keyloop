import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-aging-stock-alert',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './aging-stock-alert.component.html',
  styleUrl: './aging-stock-alert.component.scss'
})
export class AgingStockAlertComponent {
  @Input() agingVehicles: Vehicle[] | null = [];

  getTotalValue(): number {
    if (!this.agingVehicles) return 0;
    return this.agingVehicles.reduce((sum, vehicle) => sum + vehicle.price, 0);
  }

  getAverageDays(): number {
    if (!this.agingVehicles || this.agingVehicles.length === 0) return 0;
    const totalDays = this.agingVehicles.reduce((sum, vehicle) => sum + vehicle.daysInStock, 0);
    return Math.round(totalDays / this.agingVehicles.length);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  }
}

