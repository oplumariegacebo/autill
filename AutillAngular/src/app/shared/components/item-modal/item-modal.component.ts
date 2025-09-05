import { Component, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SpinnerLoadingComponent } from '../spinner-loading/spinner-loading.component';
import { ClientService } from '../../../core/services/client.service';
import { ItemService } from '../../../core/services/item.service';
import { CategoryService } from '../../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { SuppliersService } from '../../../core/services/suppliers.service';

@Component({
  selector: 'app-item-modal',
  standalone: true,
  imports: [SpinnerLoadingComponent, ReactiveFormsModule, CommonModule],
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
  categoriesService = inject(CategoryService);
  suppliersService = inject(SuppliersService);
  categories: any;
  suppliers: any;
  userId = localStorage.getItem('id') || "[]";


  initializeForm() {
    this.itemForm = new FormGroup({
      Id: new FormControl(),
      Name: new FormControl(),
      Price: new FormControl(),
      PriceImp: new FormControl({ value: '', disabled: true }),
      Iva: new FormControl(),
      Irpf: new FormControl(),
      OrderPrice: new FormControl(),
      OrderPriceImp: new FormControl({ value: '', disabled: true }),
      OrderIva: new FormControl(),
      OrderIrpf: new FormControl(),
      Ref: new FormControl(),
      Stock: new FormControl(),
      StockLimit: new FormControl(),
      IdCategory: new FormControl(),
      IdSupplier: new FormControl(),
      IdBusiness: new FormControl(this.userId)
    })
  }

  constructor(public dialogRef: MatDialogRef<ItemModalComponent>, private formBuilder: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit() {
    this.suppliersService.getAllSuppliers(this.userId).subscribe((result: any) => {
      this.suppliers = result;
    })
    this.categoriesService.getAllCategories(this.userId).subscribe((result: any) => {
      this.categories = result;
    })
    if (this.item.Id > 0) {
      this.itemForm.setValue(this.item);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  updatePriceWithTaxes(type: 'sale' | 'purchase') {
    const priceControlName = type === 'sale' ? 'Price' : 'PricePurchase';
    const ivaControlName = type === 'sale' ? 'Iva' : 'IvaPurchase';
    const irpfControlName = type === 'sale' ? 'Irpf' : 'IrpfPurchase';
    const priceImpControlName = type === 'sale' ? 'PriceImp' : 'PriceImpPurchase';

    const price = Number(this.itemForm.get(priceControlName)?.value) || 0;
    const iva = Number(this.itemForm.get(ivaControlName)?.value) || 0;
    const irpf = Number(this.itemForm.get(irpfControlName)?.value) || 0;

    const priceImp = price + (price * iva / 100) - (price * irpf / 100);

    this.itemForm.controls[priceImpControlName].setValue(priceImp.toFixed(2), {
      emitEvent: false,
    });
  }

  actionClient() {
    this.loading = true;
    const isNewItem = this.item == 0;

    if (isNewItem) {
      this.itemForm.removeControl('Id');
    }

    const itemData = this.itemForm.getRawValue();
    itemData.IdBusiness = Number(itemData.IdBusiness);
    itemData.IdCategory = Number(itemData.IdCategory);
    itemData.IdSupplier = Number(itemData.IdSupplier);

    const action$ = isNewItem
      ? this.itemService.addItem(itemData)
      : this.itemService.editItem(this.item.Id, itemData);

    action$.subscribe({
      next: (result) => {
        // this.dialogRef.close(result);
      },
      complete: () => {
        window.location.reload();
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}