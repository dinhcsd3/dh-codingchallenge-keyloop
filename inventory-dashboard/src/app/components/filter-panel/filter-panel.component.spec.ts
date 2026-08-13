import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterPanelComponent } from './filter-panel.component';
import { InventoryService } from '../../services/inventory.service';
import { Vehicle } from '../../models/vehicle.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FilterPanelComponent', () => {
  let component: FilterPanelComponent;
  let fixture: ComponentFixture<FilterPanelComponent>;
  let inventoryService: InventoryService;

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
      stockDate: '2025-12-01',
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
    await TestBed.configureTestingModule({
      imports: [
        FilterPanelComponent,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [InventoryService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    inventoryService = TestBed.inject(InventoryService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.filterForm.get('makes')?.value).toEqual([]);
    expect(component.filterForm.get('models')?.value).toEqual([]);
    expect(component.filterForm.get('years')?.value).toEqual([]);
    expect(component.filterForm.get('ageRange')?.value).toBe('');
    expect(component.filterForm.get('searchTerm')?.value).toBe('');
  });

  it('should populate available makes on vehicle input change', () => {
    component.vehicles = mockVehicles;
    component.ngOnChanges();
    
    expect(component.availableMakes.length).toBe(2);
    expect(component.availableMakes).toContain('Toyota');
    expect(component.availableMakes).toContain('Honda');
  });

  it('should populate available models on vehicle input change', () => {
    component.vehicles = mockVehicles;
    component.ngOnChanges();
    
    expect(component.availableModels.length).toBe(3);
    expect(component.availableModels).toContain('Camry');
    expect(component.availableModels).toContain('Accord');
    expect(component.availableModels).toContain('Corolla');
  });

  it('should populate available years on vehicle input change', () => {
    component.vehicles = mockVehicles;
    component.ngOnChanges();
    
    expect(component.availableYears.length).toBe(2);
    expect(component.availableYears).toContain(2023);
    expect(component.availableYears).toContain(2022);
  });

  it('should parse age range 0-30 correctly', () => {
    const [min, max] = component.parseAgeRange('0-30');
    expect(min).toBe(0);
    expect(max).toBe(30);
  });

  it('should parse age range 31-60 correctly', () => {
    const [min, max] = component.parseAgeRange('31-60');
    expect(min).toBe(31);
    expect(max).toBe(60);
  });

  it('should parse age range 61-90 correctly', () => {
    const [min, max] = component.parseAgeRange('61-90');
    expect(min).toBe(61);
    expect(max).toBe(90);
  });

  it('should parse age range 90+ correctly', () => {
    const [min, max] = component.parseAgeRange('90+');
    expect(min).toBe(91);
    expect(max).toBeUndefined();
  });

  it('should emit filter change when form values change', (done) => {
    component.filterChange.subscribe(filter => {
      expect(filter.makes).toEqual(['Toyota']);
      done();
    });

    component.filterForm.patchValue({ makes: ['Toyota'] });
  });

  it('should clear all filters', () => {
    component.filterForm.patchValue({
      makes: ['Toyota'],
      models: ['Camry'],
      years: [2023],
      ageRange: '0-30',
      searchTerm: 'test'
    });

    component.clearFilters();

    expect(component.filterForm.get('makes')?.value).toEqual([]);
    expect(component.filterForm.get('models')?.value).toEqual([]);
    expect(component.filterForm.get('years')?.value).toEqual([]);
    expect(component.filterForm.get('ageRange')?.value).toBe('');
    expect(component.filterForm.get('searchTerm')?.value).toBe('');
  });

  it('should apply filter with multiple criteria', (done) => {
    component.filterChange.subscribe(filter => {
      expect(filter.makes).toEqual(['Toyota']);
      expect(filter.years).toEqual([2023]);
      expect(filter.minDaysInStock).toBe(0);
      expect(filter.maxDaysInStock).toBe(30);
      done();
    });

    component.filterForm.patchValue({
      makes: ['Toyota'],
      years: [2023],
      ageRange: '0-30'
    });
  });

  it('should not include empty arrays in filter', (done) => {
    component.filterChange.subscribe(filter => {
      expect(filter.makes).toBeUndefined();
      expect(filter.models).toBeUndefined();
      expect(filter.years).toBeUndefined();
      done();
    });

    component.filterForm.patchValue({
      makes: [],
      models: [],
      years: []
    });
  });
});
