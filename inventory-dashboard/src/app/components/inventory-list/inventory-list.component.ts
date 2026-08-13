import { Component, Input, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Vehicle } from '../../models/vehicle.model';
import { ActionDialogComponent } from '../action-dialog/action-dialog.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss'
})
export class InventoryListComponent implements OnChanges {
  @Input() vehicles: Vehicle[] | null = [];
  @Input() highlightAging = true;
  @Output() vehicleAction = new EventEmitter<Vehicle>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['vin', 'make', 'model', 'year', 'daysInStock', 'price', 'status', 'actions'];
  dataSource = new MatTableDataSource<Vehicle>([]);

  constructor(private dialog: MatDialog) {}

  ngOnChanges(): void {
    if (this.vehicles) {
      this.dataSource.data = this.vehicles;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  isAging(vehicle: Vehicle): boolean {
    return vehicle.daysInStock > 90;
  }

  isWarning(vehicle: Vehicle): boolean {
    return vehicle.daysInStock > 60 && vehicle.daysInStock <= 90;
  }

  getRowClass(vehicle: Vehicle): string {
    if (!this.highlightAging) return '';
    if (this.isAging(vehicle)) return 'aging-row';
    if (this.isWarning(vehicle)) return 'warning-row';
    return '';
  }

  openActionDialog(vehicle: Vehicle): void {
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      width: '500px',
      data: { vehicle }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vehicleAction.emit(vehicle);
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }
}

