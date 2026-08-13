import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { InventoryListComponent } from './inventory-list.component';
import { Vehicle } from '../../models/vehicle.model';

describe('InventoryListComponent', () => {
  let component: InventoryListComponent;
  let fixture: ComponentFixture<InventoryListComponent>;
  let dialog: MatDialog;

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
      stockDate: '2025-11-01',
      daysInStock: 100,
      price: 28000,
      status: 'available',
      color: 'Blue',
      mileage: 20000
    },
    {
      id: '3',
      vin: 'TEST789',
      make: 'Ford',
      model: 'F-150',
      year: 2021,
      stockDate: '2025-10-01',
      daysInStock: 70,
      price: 35000,
      status: 'available',
      color: 'Red',
      mileage: 25000
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InventoryListComponent,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatDialogModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryListComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty data source', () => {
    expect(component.dataSource.data.length).toBe(0);
  });

  it('should update data source when vehicles input changes', () => {
    component.vehicles = mockVehicles;
    component.ngOnChanges();
    
    expect(component.dataSource.data.length).toBe(3);
    expect(component.dataSource.data).toEqual(mockVehicles);
  });

  it('should identify aging vehicles (>90 days)', () => {
    const agingVehicle: Vehicle = { ...mockVehicles[0], daysInStock: 95 };
    expect(component.isAging(agingVehicle)).toBe(true);
    expect(component.isAging(mockVehicles[0])).toBe(false);
  });

  it('should identify warning vehicles (61-90 days)', () => {
    const warningVehicle: Vehicle = { ...mockVehicles[0], daysInStock: 75 };
    expect(component.isWarning(warningVehicle)).toBe(true);
    expect(component.isWarning(mockVehicles[0])).toBe(false);
  });

  it('should return correct row class for aging vehicles', () => {
    const agingVehicle: Vehicle = { ...mockVehicles[0], daysInStock: 95 };
    component.highlightAging = true;
    expect(component.getRowClass(agingVehicle)).toBe('aging-row');
  });

  it('should return correct row class for warning vehicles', () => {
    const warningVehicle: Vehicle = { ...mockVehicles[0], daysInStock: 75 };
    component.highlightAging = true;
    expect(component.getRowClass(warningVehicle)).toBe('warning-row');
  });

  it('should return empty string when highlighting is disabled', () => {
    const agingVehicle: Vehicle = { ...mockVehicles[0], daysInStock: 95 };
    component.highlightAging = false;
    expect(component.getRowClass(agingVehicle)).toBe('');
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(25000)).toBe('$25,000');
    expect(component.formatPrice(1234567)).toBe('$1,234,567');
  });

  it('should have correct displayed columns', () => {
    expect(component.displayedColumns).toEqual([
      'vin', 'make', 'model', 'year', 'daysInStock', 'price', 'status', 'actions'
    ]);
  });

  it('should render table when vehicles are provided', () => {
    component.vehicles = mockVehicles;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('table')).toBeTruthy();
  });
});
