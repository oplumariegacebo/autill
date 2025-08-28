import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Messages } from '../../../core/services/common-service.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { MatDialogRef } from '@angular/material/dialog';
import { SpinnerLoadingComponent } from '../spinner-loading/spinner-loading.component';

@Component({
  selector: 'app-supplier-modal',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerLoadingComponent],
  templateUrl: './supplier-modal.component.html',
  styleUrl: './supplier-modal.component.css'
})
export class SupplierModalComponent {
  id!: number;
  action!: string;
  supplierForm!: FormGroup;
  client: Object = {};
  loading: boolean = false;
  suppliersService = inject(SuppliersService);
  formatNif = false;
  formatZip = false;
  formatName = false;
  formatPhoneNumber = false;
  formatEmail = false;
  messages = Messages;
  title: string = 'Cliente'

  initializeForm() {
    this.supplierForm = new FormGroup({
      Id: new FormControl(),
      Name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      Address: new FormControl(),
      Region: new FormControl(),
      City: new FormControl(),
      PostalCode: new FormControl('', [Validators.pattern(/^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/), Validators.required, Validators.maxLength(5)]),
      Email: new FormControl('', [Validators.required, Validators.email]),
      Country: new FormControl(),
      IdBusiness: new FormControl(localStorage.getItem('id') || "[]"),
      Nif: new FormControl('', [Validators.pattern(/(^[ABCDFGHJKLMNPQRSUVWabcdfghlmnpqrsuvw]([0-9]{7})([0-9A-Ja]$))|(^[0-9]{8}[A-Z]$)/), Validators.required, Validators.maxLength(9)]),
      PhoneNumber: new FormControl('', [Validators.pattern(/^[+]?(?:\(\d+(?:\.\d+)?\)|\d+(?:\.\d+)?)(?:[ -]?(?:\(\d+(?:\.\d+)?\)|\d+(?:\.\d+)?))*(?:[ ]?(?:x|ext)\.?[ ]?\d{1,5})?$/), Validators.required, Validators.maxLength(9)])
    })
  }

  constructor(public dialogRef: MatDialogRef<SupplierModalComponent>, private formBuilder: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit() {
    if (this.id > 0) {
      this.suppliersService.getSupplierById(this.id).subscribe((supplier: any) => {
        this.supplierForm.setValue(supplier.data);
      })
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  actionClient() {
    const service = this.action === 'edit' ? this.suppliersService : this.suppliersService;

    if (this.supplierForm.valid) {
      this.loading = true;
      if (this.id == 0) {
        this.supplierForm.removeControl('Id');
        service.add(this.supplierForm.value).subscribe({
          next: () => {
            this.supplierForm.addControl('Id', new FormControl());
          },
          complete: () => {
            window.location.reload();
          }
        });
      } else {
        service.edit(this.id, this.supplierForm.value).subscribe({
          complete: () => {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
      }
    } else {
      if (!this.supplierForm.controls['PhoneNumber'].valid) {
        this.formatPhoneNumber = true;
      }
      if (!this.supplierForm.controls['Name'].valid) {
        this.formatName = true;
      }
      if (!this.supplierForm.controls['Nif'].valid) {
        this.formatNif = true;
      }
      if (!this.supplierForm.controls['PostalCode'].valid) {
        this.formatZip = true;
      }
      if (!this.supplierForm.controls['Email'].valid) {
        this.formatEmail = true;
      }
    }
  }
}
