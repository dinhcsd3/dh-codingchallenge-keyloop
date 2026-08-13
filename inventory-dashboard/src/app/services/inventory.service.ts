import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, combineLatest } from 'rxjs';
import { differenceInDays, parseISO } from 'date-fns';
import { Vehicle, VehicleFilter } from '../models/vehicle.model';
import { ActionLog } from '../models/action-log.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`).pipe(
      map(vehicles => this.calculateDaysInStock(vehicles))
    );
  }

  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/vehicles/${id}`).pipe(
      map(vehicle => this.calculateDaysInStockForVehicle(vehicle))
    );
  }

  filterVehicles(vehicles: Vehicle[], filter: VehicleFilter): Vehicle[] {
    return vehicles.filter(vehicle => {
      // Filter by makes
      if (filter.makes && filter.makes.length > 0 && !filter.makes.includes(vehicle.make)) {
        return false;
      }

      // Filter by models
      if (filter.models && filter.models.length > 0 && !filter.models.includes(vehicle.model)) {
        return false;
      }

      // Filter by years
      if (filter.years && filter.years.length > 0 && !filter.years.includes(vehicle.year)) {
        return false;
      }

      // Filter by days in stock range
      if (filter.minDaysInStock !== undefined && vehicle.daysInStock < filter.minDaysInStock) {
        return false;
      }
      if (filter.maxDaysInStock !== undefined && vehicle.daysInStock > filter.maxDaysInStock) {
        return false;
      }

      // Filter by status
      if (filter.statuses && filter.statuses.length > 0 && !filter.statuses.includes(vehicle.status)) {
        return false;
      }

      // Filter by search term (VIN or model)
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesVin = vehicle.vin.toLowerCase().includes(searchLower);
        const matchesModel = vehicle.model.toLowerCase().includes(searchLower);
        const matchesMake = vehicle.make.toLowerCase().includes(searchLower);
        if (!matchesVin && !matchesModel && !matchesMake) {
          return false;
        }
      }

      return true;
    });
  }

  getAgingStock(vehicles: Vehicle[]): Vehicle[] {
    return vehicles.filter(vehicle => vehicle.daysInStock > 90);
  }

  getUniqueMakes(vehicles: Vehicle[]): string[] {
    const makes = vehicles.map(v => v.make);
    return Array.from(new Set(makes)).sort();
  }

  getUniqueModels(vehicles: Vehicle[]): string[] {
    const models = vehicles.map(v => v.model);
    return Array.from(new Set(models)).sort();
  }

  getUniqueYears(vehicles: Vehicle[]): number[] {
    const years = vehicles.map(v => v.year);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }

  getActionLogs(): Observable<ActionLog[]> {
    return this.http.get<ActionLog[]>(`${this.apiUrl}/actionLogs`);
  }

  getActionLogsByVehicleId(vehicleId: string): Observable<ActionLog[]> {
    return this.http.get<ActionLog[]>(`${this.apiUrl}/actionLogs?vehicleId=${vehicleId}`);
  }

  createActionLog(actionLog: Omit<ActionLog, 'id' | 'timestamp'>): Observable<ActionLog> {
    return this.http.post<ActionLog>(`${this.apiUrl}/actionLogs`, {
      ...actionLog,
      timestamp: new Date().toISOString()
    });
  }

  updateActionLog(id: string, actionLog: Partial<ActionLog>): Observable<ActionLog> {
    return this.http.patch<ActionLog>(`${this.apiUrl}/actionLogs/${id}`, actionLog);
  }

  deleteActionLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/actionLogs/${id}`);
  }

  private calculateDaysInStock(vehicles: Vehicle[]): Vehicle[] {
    return vehicles.map(vehicle => this.calculateDaysInStockForVehicle(vehicle));
  }

  private calculateDaysInStockForVehicle(vehicle: Vehicle): Vehicle {
    const stockDate = parseISO(vehicle.stockDate);
    const today = new Date();
    const daysInStock = differenceInDays(today, stockDate);

    return {
      ...vehicle,
      daysInStock
    };
  }
}
