import { Component, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SpinnerLoadingComponent } from '../spinner-loading/spinner-loading.component';
import { ClientService } from '../../../core/services/client.service';
import { ItemService } from '../../../core/services/item.service';

@Component({
  selector: 'app-item-modal',
  standalone: true,
  imports: [SpinnerLoadingComponent, ReactiveFormsModule],
  templateUrl: './item-modal.component.html',
  styleUrl: './item-modal.component.css'
})
export class ItemModalComponent {
  itemForm!: FormGroup
  item!: any;
  client: Object = {};
  loading: boolean = false;
  apiService = inject(ApiService);
  clientService = inject(ClientService);
  itemService = inject(ItemService);

  initializeForm() {
    this.itemForm = new FormGroup({
      Id: new FormControl(),
      Name: new FormControl(),
      Price: new FormControl(),
      PriceImp: new FormControl({ value: '', disabled: true }),
      Iva: new FormControl(),
      Irpf: new FormControl(),
      Ref: new FormControl(),
      Stock: new FormControl(),
      StockLimit: new FormControl(),
      IdCategory: new FormControl(),
      IdSupplier: new FormControl(),
      IdBusiness: new FormControl(localStorage.getItem('id') || "[]")
    })
  }

  constructor(public dialogRef: MatDialogRef<ItemModalComponent>, private formBuilder: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit() {
    if (this.item.Id > 0) {
      this.itemForm.setValue(this.item);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  updateLivePriceImp($event: Event) {
    const input = $event.target as HTMLInputElement;
    const value = Number(input.value) || 0;

    this.updatePriceImp();
}

  updatePriceImp() {
    const price = Number(this.itemForm.get('Price')?.value) || 0;
    const iva = Number(this.itemForm.get('Iva')?.value) || 0;
    const irpf = Number(this.itemForm.get('Irpf')?.value) || 0;

    const priceImp = price + (price * iva / 100) - (price * irpf / 100);

    this.itemForm.controls['PriceImp'].setValue(priceImp.toFixed(2), { emitEvent: false });
  }

  actionClient() {
    this.loading = true;
    if (this.item == 0) {
      this.itemForm.removeControl('Id');
      const itemData = this.itemForm.getRawValue();
      this.itemService.addItem(itemData).subscribe({
        next: (newItem) => {
          //this.dialogRef.close(newItem);
        },
        complete: () => {
          window.location.reload();
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      const itemData = this.itemForm.getRawValue();
      console.log(this.itemForm);
      this.itemService.editItem(this.item.Id, itemData).subscribe({
        next: (updatedItem) => {
          //this.dialogRef.close(updatedItem);
        },
        complete: () => {
          window.location.reload();
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }
}