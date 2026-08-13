export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  stockDate: string;
  daysInStock: number;
  price: number;
  status: 'available' | 'sold' | 'reserved';
  color: string;
  mileage: number;
}

export interface VehicleFilter {
  makes?: string[];
  models?: string[];
  years?: number[];
  minDaysInStock?: number;
  maxDaysInStock?: number;
  statuses?: string[];
  searchTerm?: string;
}
