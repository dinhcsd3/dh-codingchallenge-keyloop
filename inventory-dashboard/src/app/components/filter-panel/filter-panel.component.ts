import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Vehicle, VehicleFilter } from '../../models/vehicle.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss'
})
export class FilterPanelComponent implements OnChanges {
  @Input() vehicles: Vehicle[] | null = [];
  @Output() filterChange = new EventEmitter<VehicleFilter>();

  filterForm: FormGroup;
  availableMakes: string[] = [];
  availableModels: string[] = [];
  availableYears: number[] = [];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService
  ) {
    this.filterForm = this.fb.group({
      makes: [[]],
      models: [[]],
      years: [[]],
      ageRange: [''],
      searchTerm: ['']
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }

  ngOnChanges(): void {
    if (this.vehicles && this.vehicles.length > 0) {
      this.availableMakes = this.inventoryService.getUniqueMakes(this.vehicles);
      this.availableModels = this.inventoryService.getUniqueModels(this.vehicles);
      this.availableYears = this.inventoryService.getUniqueYears(this.vehicles);
    }
  }

  applyFilter(): void {
    const formValue = this.filterForm.value;
    const filter: VehicleFilter = {
      makes: formValue.makes && formValue.makes.length > 0 ? formValue.makes : undefined,
      models: formValue.models && formValue.models.length > 0 ? formValue.models : undefined,
      years: formValue.years && formValue.years.length > 0 ? formValue.years : undefined,
      searchTerm: formValue.searchTerm || undefined
    };

    if (formValue.ageRange) {
      const [min, max] = this.parseAgeRange(formValue.ageRange);
      filter.minDaysInStock = min;
      filter.maxDaysInStock = max;
    }

    this.filterChange.emit(filter);
  }

  parseAgeRange(range: string): [number | undefined, number | undefined] {
    switch (range) {
      case '0-30':
        return [0, 30];
      case '31-60':
        return [31, 60];
      case '61-90':
        return [61, 90];
      case '90+':
        return [91, undefined];
      default:
        return [undefined, undefined];
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      makes: [],
      models: [],
      years: [],
      ageRange: '',
      searchTerm: ''
    });
  }
}

