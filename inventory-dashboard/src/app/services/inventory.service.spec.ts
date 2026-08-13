import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InventoryService } from './inventory.service';
import { Vehicle } from '../models/vehicle.model';

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;

  const mockVehicle: Vehicle = {
    id: '1',
    vin: 'TEST123456',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    stockDate: '2026-05-01',
    daysInStock: 0,
    price: 28500,
    status: 'available',
    color: 'Silver',
    mileage: 15000
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InventoryService]
    });
    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate days in stock correctly', () => {
    const vehicles: Vehicle[] = [mockVehicle];
    const mockResponse = [mockVehicle];

    service.getVehicles().subscribe(result => {
      expect(result.length).toBe(1);
      expect(result[0].daysInStock).toBeGreaterThan(0); // Should be calculated
    });

    const req = httpMock.expectOne('http://localhost:3000/vehicles');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should identify aging stock (vehicles > 90 days)', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, id: '1', daysInStock: 50 },
      { ...mockVehicle, id: '2', daysInStock: 95 },
      { ...mockVehicle, id: '3', daysInStock: 120 },
      { ...mockVehicle, id: '4', daysInStock: 30 }
    ];

    const agingStock = service.getAgingStock(vehicles);

    expect(agingStock.length).toBe(2);
    expect(agingStock[0].daysInStock).toBeGreaterThan(90);
    expect(agingStock[1].daysInStock).toBeGreaterThan(90);
  });

  it('should filter vehicles by make', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, id: '1', make: 'Toyota' },
      { ...mockVehicle, id: '2', make: 'Honda' },
      { ...mockVehicle, id: '3', make: 'Toyota' },
      { ...mockVehicle, id: '4', make: 'Ford' }
    ];

    const filtered = service.filterVehicles(vehicles, { makes: ['Toyota'] });

    expect(filtered.length).toBe(2);
    expect(filtered.every(v => v.make === 'Toyota')).toBe(true);
  });

  it('should filter vehicles by multiple criteria', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, id: '1', make: 'Toyota', year: 2023, daysInStock: 50 },
      { ...mockVehicle, id: '2', make: 'Honda', year: 2023, daysInStock: 100 },
      { ...mockVehicle, id: '3', make: 'Toyota', year: 2022, daysInStock: 100 },
      { ...mockVehicle, id: '4', make: 'Toyota', year: 2023, daysInStock: 100 }
    ];

    const filtered = service.filterVehicles(vehicles, {
      makes: ['Toyota'],
      years: [2023],
      minDaysInStock: 90
    });

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('4');
  });

  it('should filter vehicles by search term', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, id: '1', vin: 'ABC123', make: 'Toyota', model: 'Camry' },
      { ...mockVehicle, id: '2', vin: 'XYZ789', make: 'Honda', model: 'Civic' },
      { ...mockVehicle, id: '3', vin: 'CAM456', make: 'Toyota', model: 'Corolla' }
    ];

    const filtered = service.filterVehicles(vehicles, { searchTerm: 'CAM' });

    expect(filtered.length).toBe(2); // Matches VIN 'CAM456' and model 'Camry'
  });

  it('should return unique makes', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, make: 'Toyota' },
      { ...mockVehicle, make: 'Honda' },
      { ...mockVehicle, make: 'Toyota' },
      { ...mockVehicle, make: 'Ford' }
    ];

    const makes = service.getUniqueMakes(vehicles);

    expect(makes.length).toBe(3);
    expect(makes).toEqual(['Ford', 'Honda', 'Toyota']); // Should be sorted
  });

  it('should create an action log', () => {
    const actionLog = {
      vehicleId: '1',
      action: 'Price Reduction',
      notes: 'Reduce price by $2000',
      user: 'Test Manager',
      proposedDate: '2026-08-15'
    };

    service.createActionLog(actionLog).subscribe(result => {
      expect(result).toBeTruthy();
      expect(result.timestamp).toBeDefined();
    });

    const req = httpMock.expectOne('http://localhost:3000/actionLogs');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.vehicleId).toBe('1');
    req.flush({ id: '1', ...actionLog, timestamp: new Date().toISOString() });
  });

  it('should handle empty vehicle list', () => {
    const filtered = service.filterVehicles([], { makes: ['Toyota'] });
    expect(filtered.length).toBe(0);

    const aging = service.getAgingStock([]);
    expect(aging.length).toBe(0);
  });

  it('should get vehicle by id', () => {
    service.getVehicleById('1').subscribe(result => {
      expect(result.id).toBe('1');
      expect(result.daysInStock).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne('http://localhost:3000/vehicles/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockVehicle);
  });

  it('should get unique models', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, model: 'Camry' },
      { ...mockVehicle, model: 'Corolla' },
      { ...mockVehicle, model: 'Camry' },
      { ...mockVehicle, model: 'Accord' }
    ];

    const models = service.getUniqueModels(vehicles);

    expect(models.length).toBe(3);
    expect(models).toEqual(['Accord', 'Camry', 'Corolla']); // Should be sorted
  });

  it('should get unique years sorted descending', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, year: 2023 },
      { ...mockVehicle, year: 2021 },
      { ...mockVehicle, year: 2023 },
      { ...mockVehicle, year: 2022 }
    ];

    const years = service.getUniqueYears(vehicles);

    expect(years.length).toBe(3);
    expect(years).toEqual([2023, 2022, 2021]); // Should be sorted descending
  });

  it('should filter vehicles by model', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, id: '1', model: 'Camry' },
      { ...mockVehicle, id: '2', model: 'Corolla' },
      { ...mockVehicle, id: '3', model: 'Camry' }
    ];

    const filtered = service.filterVehicles(vehicles, { models: ['Camry'] });

    expect(filtered.length).toBe(2);
    expect(filtered.every(v => v.model === 'Camry')).toBe(true);
  });

  it('should filter vehicles by year', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, id: '1', year: 2023 },
      { ...mockVehicle, id: '2', year: 2022 },
      { ...mockVehicle, id: '3', year: 2023 }
    ];

    const filtered = service.filterVehicles(vehicles, { years: [2023] });

    expect(filtered.length).toBe(2);
    expect(filtered.every(v => v.year === 2023)).toBe(true);
  });

  it('should filter vehicles by max days in stock', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, id: '1', daysInStock: 30 },
      { ...mockVehicle, id: '2', daysInStock: 60 },
      { ...mockVehicle, id: '3', daysInStock: 90 }
    ];

    const filtered = service.filterVehicles(vehicles, { maxDaysInStock: 60 });

    expect(filtered.length).toBe(2);
    expect(filtered.every(v => v.daysInStock <= 60)).toBe(true);
  });

  it('should filter vehicles by status', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, id: '1', status: 'available' },
      { ...mockVehicle, id: '2', status: 'sold' },
      { ...mockVehicle, id: '3', status: 'available' }
    ];

    const filtered = service.filterVehicles(vehicles, { statuses: ['available'] });

    expect(filtered.length).toBe(2);
    expect(filtered.every(v => v.status === 'available')).toBe(true);
  });

  it('should get action logs', () => {
    const mockLogs = [
      { id: '1', vehicleId: '1', action: 'Price Reduction', notes: 'Test', user: 'Test', timestamp: '2026-08-13', proposedDate: '2026-08-15' }
    ];

    service.getActionLogs().subscribe(logs => {
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('Price Reduction');
    });

    const req = httpMock.expectOne('http://localhost:3000/actionLogs');
    expect(req.request.method).toBe('GET');
    req.flush(mockLogs);
  });

  it('should get action logs by vehicle id', () => {
    const mockLogs = [
      { id: '1', vehicleId: '1', action: 'Price Reduction', notes: 'Test', user: 'Test', timestamp: '2026-08-13', proposedDate: '2026-08-15' }
    ];

    service.getActionLogsByVehicleId('1').subscribe(logs => {
      expect(logs.length).toBe(1);
      expect(logs[0].vehicleId).toBe('1');
    });

    const req = httpMock.expectOne('http://localhost:3000/actionLogs?vehicleId=1');
    expect(req.request.method).toBe('GET');
    req.flush(mockLogs);
  });

  it('should update action log', () => {
    const updates = { notes: 'Updated notes' };

    service.updateActionLog('1', updates).subscribe(result => {
      expect(result.notes).toBe('Updated notes');
    });

    const req = httpMock.expectOne('http://localhost:3000/actionLogs/1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: '1', ...updates });
  });

  it('should delete action log', () => {
    service.deleteActionLog('1').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/actionLogs/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should filter by make (case insensitive search)', () => {
    const vehicles: Vehicle[] = [
      { ...mockVehicle, id: '1', vin: 'ABC', make: 'Toyota', model: 'Camry' },
      { ...mockVehicle, id: '2', vin: 'XYZ', make: 'Honda', model: 'Civic' }
    ];

    const filtered = service.filterVehicles(vehicles, { searchTerm: 'toyota' });

    expect(filtered.length).toBe(1);
    expect(filtered[0].make).toBe('Toyota');
  });
});
