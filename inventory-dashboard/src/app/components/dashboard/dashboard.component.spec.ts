import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { InventoryService } from '../../services/inventory.service';
import { LoggingService } from '../../services/logging.service';
import { Vehicle } from '../../models/vehicle.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockInventoryService: jasmine.SpyObj<InventoryService>;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;

  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      vin: 'TEST123',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      stockDate: '2026-01-01',
      daysInStock: 50,
      price: 25000,
      status: 'available',
      color: 'Silver',
      mileage: 15000
    },
    {
      id: '2',
      vin: 'TEST456',
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      stockDate: '2025-10-01',
      daysInStock: 100,
      price: 28000,
      status: 'available',
      color: 'Blue',
      mileage: 20000
    },
    {
      id: '3',
      vin: 'TEST789',
      make: 'Toyota',
      model: 'Corolla',
      year: 2023,
      stockDate: '2026-02-01',
      daysInStock: 30,
      price: 22000,
      status: 'available',
      color: 'Red',
      mileage: 10000
    }
  ];

  beforeEach(async () => {
    mockInventoryService = jasmine.createSpyObj('InventoryService', [
      'getVehicles',
      'filterVehicles',
      'getAgingStock'
    ]);
    mockLoggingService = jasmine.createSpyObj('LoggingService', ['info', 'error', 'debug']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: LoggingService, useValue: mockLoggingService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load vehicles on init', () => {
    mockInventoryService.getVehicles.and.returnValue(of(mockVehicles));
    mockInventoryService.filterVehicles.and.returnValue(mockVehicles);
    mockInventoryService.getAgingStock.and.returnValue([]);

    component.ngOnInit();

    expect(mockInventoryService.getVehicles).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
    expect(component.vehicles$.value).toEqual(mockVehicles);
  });

  it('should handle load error gracefully', () => {
    mockInventoryService.getVehicles.and.returnValue(
      throwError(() => new Error('Failed to load'))
    );

    component.ngOnInit();

    expect(component.isLoading).toBe(false);
    expect(component.error).toBeTruthy();
    expect(mockLoggingService.error).toHaveBeenCalled();
  });

  it('should apply filter when filter changes', () => {
    const agingVehicle = { ...mockVehicles[1], daysInStock: 100 };
    mockInventoryService.getVehicles.and.returnValue(of(mockVehicles));
    mockInventoryService.filterVehicles.and.returnValue([mockVehicles[0]]);
    mockInventoryService.getAgingStock.and.returnValue([agingVehicle]);

    component.ngOnInit();
    component.onFilterChange({ makes: ['Toyota'] });

    expect(mockInventoryService.filterVehicles).toHaveBeenCalledWith(
      mockVehicles,
      { makes: ['Toyota'] }
    );
    expect(component.filteredVehicles$.value).toEqual([mockVehicles[0]]);
  });

  it('should identify aging stock when applying filter', () => {
    const agingVehicle = { ...mockVehicles[1], daysInStock: 100 };
    mockInventoryService.getVehicles.and.returnValue(of(mockVehicles));
    mockInventoryService.filterVehicles.and.returnValue(mockVehicles);
    mockInventoryService.getAgingStock.and.returnValue([agingVehicle]);

    component.ngOnInit();

    expect(mockInventoryService.getAgingStock).toHaveBeenCalled();
    expect(component.agingStock$.value).toEqual([agingVehicle]);
  });

  it('should log vehicle action', () => {
    component.onVehicleAction(mockVehicles[0]);

    expect(mockLoggingService.info).toHaveBeenCalledWith(
      'Vehicle action triggered',
      { vehicleId: mockVehicles[0].id }
    );
  });

  it('should initialize with loading state', () => {
    expect(component.isLoading).toBe(true);
    expect(component.error).toBeNull();
  });

  it('should update filtered vehicles when vehicles load', () => {
    mockInventoryService.getVehicles.and.returnValue(of(mockVehicles));
    mockInventoryService.filterVehicles.and.returnValue(mockVehicles);
    mockInventoryService.getAgingStock.and.returnValue([mockVehicles[1]]);

    component.ngOnInit();

    expect(component.filteredVehicles$.value.length).toBe(3);
    expect(component.agingStock$.value.length).toBe(1);
  });

  it('should log when loading vehicles', () => {
    mockInventoryService.getVehicles.and.returnValue(of(mockVehicles));
    mockInventoryService.filterVehicles.and.returnValue(mockVehicles);
    mockInventoryService.getAgingStock.and.returnValue([]);

    component.ngOnInit();

    expect(mockLoggingService.info).toHaveBeenCalledWith('Loading vehicle inventory');
    expect(mockLoggingService.info).toHaveBeenCalledWith('Loaded 3 vehicles');
  });

  it('should apply empty filter by default', () => {
    mockInventoryService.getVehicles.and.returnValue(of(mockVehicles));
    mockInventoryService.filterVehicles.and.returnValue(mockVehicles);
    mockInventoryService.getAgingStock.and.returnValue([]);

    component.ngOnInit();

    expect(mockInventoryService.filterVehicles).toHaveBeenCalledWith(mockVehicles, {});
  });
});
