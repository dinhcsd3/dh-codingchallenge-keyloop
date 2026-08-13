import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgingStockAlertComponent } from './aging-stock-alert.component';
import { Vehicle } from '../../models/vehicle.model';

describe('AgingStockAlertComponent', () => {
  let component: AgingStockAlertComponent;
  let fixture: ComponentFixture<AgingStockAlertComponent>;

  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      vin: 'TEST123',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      stockDate: '2026-01-01',
      daysInStock: 100,
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
      stockDate: '2025-12-01',
      daysInStock: 120,
      price: 28000,
      status: 'available',
      color: 'Blue',
      mileage: 20000
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgingStockAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgingStockAlertComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total value correctly', () => {
    component.agingVehicles = mockVehicles;
    expect(component.getTotalValue()).toBe(53000);
  });

  it('should return 0 for total value when no vehicles', () => {
    component.agingVehicles = [];
    expect(component.getTotalValue()).toBe(0);
  });

  it('should return 0 for total value when agingVehicles is null', () => {
    component.agingVehicles = null;
    expect(component.getTotalValue()).toBe(0);
  });

  it('should calculate average days correctly', () => {
    component.agingVehicles = mockVehicles;
    expect(component.getAverageDays()).toBe(110); // (100 + 120) / 2 = 110
  });

  it('should return 0 for average days when no vehicles', () => {
    component.agingVehicles = [];
    expect(component.getAverageDays()).toBe(0);
  });

  it('should return 0 for average days when agingVehicles is null', () => {
    component.agingVehicles = null;
    expect(component.getAverageDays()).toBe(0);
  });

  it('should format currency correctly', () => {
    expect(component.formatCurrency(1000)).toBe('$1,000');
    expect(component.formatCurrency(1234567)).toBe('$1,234,567');
  });

  it('should not display alert when no aging vehicles', () => {
    component.agingVehicles = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.aging-alert')).toBeFalsy();
  });

  it('should display alert when there are aging vehicles', () => {
    component.agingVehicles = mockVehicles;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.aging-alert')).toBeTruthy();
  });

  it('should display correct vehicle count', () => {
    component.agingVehicles = mockVehicles;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const statValues = compiled.querySelectorAll('.stat-value');
    expect(statValues[0].textContent?.trim()).toBe('2');
  });
});
