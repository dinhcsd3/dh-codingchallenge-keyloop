import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ActionDialogComponent } from './action-dialog.component';
import { InventoryService } from '../../services/inventory.service';
import { LoggingService } from '../../services/logging.service';
import { Vehicle } from '../../models/vehicle.model';

describe('ActionDialogComponent', () => {
  let component: ActionDialogComponent;
  let fixture: ComponentFixture<ActionDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ActionDialogComponent>>;
  let mockInventoryService: jasmine.SpyObj<InventoryService>;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;

  const mockVehicle: Vehicle = {
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
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockInventoryService = jasmine.createSpyObj('InventoryService', ['createActionLog']);
    mockLoggingService = jasmine.createSpyObj('LoggingService', ['info', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        ActionDialogComponent,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { vehicle: mockVehicle } },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: LoggingService, useValue: mockLoggingService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.actionForm.get('action')?.value).toBe('');
    expect(component.actionForm.get('notes')?.value).toBe('');
    expect(component.actionForm.get('proposedDate')?.value).toBe('');
  });

  it('should have action types defined', () => {
    expect(component.actionTypes.length).toBe(7);
    expect(component.actionTypes).toContain('Price Reduction');
    expect(component.actionTypes).toContain('Trade-In Offer');
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should not save when form is invalid', () => {
    component.onSave();
    expect(mockInventoryService.createActionLog).not.toHaveBeenCalled();
  });

  it('should save action log when form is valid', () => {
    const mockActionLog = {
      id: '1',
      vehicleId: '1',
      action: 'Price Reduction',
      notes: 'Reduce price by 10%',
      proposedDate: '2026-08-15',
      user: 'Manager Sarah Johnson',
      timestamp: '2026-08-13'
    };

    mockInventoryService.createActionLog.and.returnValue(of(mockActionLog));

    component.actionForm.patchValue({
      action: 'Price Reduction',
      notes: 'Reduce price by 10%',
      proposedDate: new Date('2026-08-15'),
      user: 'Manager Sarah Johnson'
    });

    component.onSave();

    expect(mockInventoryService.createActionLog).toHaveBeenCalled();
    expect(mockLoggingService.info).toHaveBeenCalledWith('Saving action log', jasmine.any(Object));
  });

  it('should handle save error gracefully', () => {
    mockInventoryService.createActionLog.and.returnValue(
      throwError(() => new Error('Save failed'))
    );

    component.actionForm.patchValue({
      action: 'Price Reduction',
      notes: 'Reduce price by 10%',
      proposedDate: new Date('2026-08-15'),
      user: 'Manager Sarah Johnson'
    });

    component.onSave();

    expect(mockLoggingService.error).toHaveBeenCalledWith('Error saving action log', jasmine.any(Error));
  });

  it('should require notes with minimum length', () => {
    const notesControl = component.actionForm.get('notes');
    notesControl?.setValue('short');
    expect(notesControl?.hasError('minlength')).toBe(true);
    
    notesControl?.setValue('This is a longer note with more than 10 characters');
    expect(notesControl?.hasError('minlength')).toBe(false);
  });

  it('should require action selection', () => {
    const actionControl = component.actionForm.get('action');
    expect(actionControl?.hasError('required')).toBe(true);
    
    actionControl?.setValue('Price Reduction');
    expect(actionControl?.hasError('required')).toBe(false);
  });
});
