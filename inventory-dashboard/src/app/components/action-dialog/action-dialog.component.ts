import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Vehicle } from '../../models/vehicle.model';
import { ActionType } from '../../models/action-log.model';
import { InventoryService } from '../../services/inventory.service';
import { LoggingService } from '../../services/logging.service';

interface DialogData {
  vehicle: Vehicle;
}

@Component({
  selector: 'app-action-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './action-dialog.component.html',
  styleUrl: './action-dialog.component.scss'
})
export class ActionDialogComponent {
  actionForm: FormGroup;
  actionTypes: ActionType[] = [
    'Price Reduction',
    'Trade-In Offer',
    'Auction Listing',
    'Marketing Campaign',
    'Internal Transfer',
    'Special Promotion',
    'Other'
  ];

  constructor(
    public dialogRef: MatDialogRef<ActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private logger: LoggingService,
    private snackBar: MatSnackBar
  ) {
    this.actionForm = this.fb.group({
      action: ['', Validators.required],
      notes: ['', [Validators.required, Validators.minLength(10)]],
      proposedDate: ['', Validators.required],
      user: ['Manager Sarah Johnson', Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSave(): void {
    if (this.actionForm.valid) {
      const formValue = this.actionForm.value;
      const actionLog = {
        vehicleId: this.data.vehicle.id,
        action: formValue.action,
        notes: formValue.notes,
        proposedDate: formValue.proposedDate.toISOString(),
        user: formValue.user
      };

      this.logger.info('Saving action log', actionLog);

      this.inventoryService.createActionLog(actionLog).subscribe({
        next: (savedLog) => {
          this.logger.info('Action log saved successfully', savedLog);
          this.snackBar.open('Action logged successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.logger.error('Error saving action log', error);
          this.snackBar.open('Failed to save action. Please try again.', 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }
  }
}

