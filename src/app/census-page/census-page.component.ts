import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CensusRecord } from '../census.model';
import { CensusService } from '../census.service';

type CensusFormValue = {
  numberOfPeople: number | null;
  street: string;
  city: string;
  state: string;
  zip: string;
  year: number | null;
  censusTaker: string;
};

@Component({
  selector: 'app-census-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './census-page.component.html',
  styleUrl: './census-page.component.css'
})
export class CensusPageComponent implements OnInit {
  records: CensusRecord[] = [];
  selectedRecordId: string | null = null;
  isSaving = false;
  loading = false;
  errorMessage = '';
  readonly form;
  private readonly blankFormValue: CensusFormValue = {
    numberOfPeople: null,
    street: '',
    city: '',
    state: '',
    zip: '',
    year: null,
    censusTaker: ''
  };

  constructor(
    private readonly censusService: CensusService,
    private readonly formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      numberOfPeople: [this.blankFormValue.numberOfPeople, [Validators.required, Validators.min(0)]],
      street: [this.blankFormValue.street, [Validators.required]],
      city: [this.blankFormValue.city, [Validators.required]],
      state: [this.blankFormValue.state, [Validators.required, Validators.maxLength(2)]],
      zip: [this.blankFormValue.zip, [Validators.required]],
      year: [this.blankFormValue.year, [Validators.required]],
      censusTaker: [this.blankFormValue.censusTaker, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadRecords();
  }

  get isEditing(): boolean {
    return this.selectedRecordId !== null;
  }

  loadRecords(): void {
    this.loading = true;
    this.censusService.getAll().pipe(finalize(() => (this.loading = false))).subscribe({
      next: (records) => {
        this.records = records;
      },
      error: () => {
        this.errorMessage = 'Unable to load census records from MongoDB.';
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.toPayload(this.form.getRawValue());
    this.isSaving = true;
    this.errorMessage = '';

    const request = this.isEditing && this.selectedRecordId
      ? this.censusService.update(this.selectedRecordId, payload)
      : this.censusService.create(payload);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.resetForm();
        this.loadRecords();
      },
      error: () => {
        this.errorMessage = 'Unable to save the census record.';
      }
    });
  }

  edit(record: CensusRecord): void {
    this.selectedRecordId = record._id || null;
    this.form.setValue({
      numberOfPeople: record.numberOfPeople,
      street: record.address.street,
      city: record.address.city,
      state: record.address.state,
      zip: record.address.zip,
      year: record.year,
      censusTaker: record.censusTaker
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  delete(record: CensusRecord): void {
    if (!record._id) {
      return;
    }

    this.censusService.delete(record._id).subscribe({
      next: () => {
        if (this.selectedRecordId === record._id) {
          this.resetForm();
        }
        this.loadRecords();
      },
      error: () => {
        this.errorMessage = 'Unable to delete the census record.';
      }
    });
  }

  trackById(_: number, record: CensusRecord): string | undefined {
    return record._id;
  }

  private resetForm(): void {
    this.selectedRecordId = null;
    this.form.reset(this.blankFormValue);
  }

  private toPayload(value: CensusFormValue): CensusRecord {
    return {
      numberOfPeople: Number(value.numberOfPeople),
      address: {
        street: value.street.trim(),
        city: value.city.trim(),
        state: value.state.trim().toUpperCase(),
        zip: value.zip.trim()
      },
      year: Number(value.year),
      censusTaker: value.censusTaker.trim()
    };
  }
}