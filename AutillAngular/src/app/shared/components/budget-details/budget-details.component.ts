import { Component, inject, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../core/services/api.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { map, Observable, startWith } from 'rxjs';
import { Item } from '../../../core/models/Item';
import { ItemService } from '../../../core/services/item.service';


@Component({
  selector: 'app-budget-details',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './budget-details.component.html',
  styleUrl: './budget-details.component.css'
})
export class BudgetDetailsComponent {
  items = [{ Id: 0, Name: '', Units: 0, Price: 0, TotalConcept: 0 }];
  data = [];
  dbItems: any = [];
  apiService = inject(ApiService);
  itemService = inject(ItemService);
  Item = new FormControl<ItemInit | string>('');
  filteredItems!: Observable<Item[]>;
  lastOptionIdSelected: number = 0;
  lasItemAdded: any = {};
  detailsForm!: FormGroup;
  nameDefault: string = '';

  initializeForm() {
    this.detailsForm = new FormGroup({
      Item0: new FormControl(),
      PriceTD0: new FormControl(),
      Units0: new FormControl()
    })
  }

  constructor(public dialogRef: MatDialogRef<BudgetDetailsComponent>) {
    this.initializeForm();
  }

  ngOnInit() {
    if (this.data.length > 0) {
      this.items = this.data;

      for (let i = 0; i < this.items.length; i++) {
        this.newFormControls(i);
      }
    }

    this.itemService.getAllItems(localStorage.getItem('id') || "[]").subscribe((data: any) => {
      this.dbItems = data.data;

      this.filteredItems = this.detailsForm.controls['Item0'].valueChanges.pipe(
        startWith(''),
        map(value => {
          const item = value;
          return item ? this._filter(item as string) : this.dbItems || '';
        }),
      );
    })

    for (let i = 0; i < this.items.length; i++) {
      if (i > 0) {
        this.detailsForm.addControl(`Item${i}`, new FormControl());
      }
    }
  }

  ngAfterViewInit() {
    for (let i = 0; i < this.items.length; i++) {
      this.detailsForm.get(`Item${i}`)!.setValue(this.items[i].Name);
      this.detailsForm.get(`Units${i}`)!.setValue(this.items[i].Units);
      this.detailsForm.get(`PriceTD${i}`)!.setValue(this.items[i].Price);
    }
  }

  onClose(): void {
    // Filtrar solo los productos con nombre y unidades válidas
    const itemsValidos = this.items.filter(item => {
      return item.Name && item.Name.trim() !== '' && item.Units > 0;
    });
    this.dialogRef.close({ data: itemsValidos });
  }

  addItem(id: number, type:string) {
    if(type === 'form'){
      const itemName = this.detailsForm.controls['Item' + (id-1)].value;
      if (!itemName || itemName.trim() === '') {
        // No añadir si el producto está vacío
        return;
      }
      let units = parseFloat(this.detailsForm.controls['Units' + (id-1)].value);

      this.items[(id-1)].Name = itemName;
      this.items[(id-1)].Units = units;
      this.items[(id-1)].Price = parseFloat(this.lasItemAdded.Price);
      this.items[(id-1)].TotalConcept = Number((units * this.items[(id-1)].Price).toFixed(2));

      this.newFormControls(id);

      this.items.push({ Id: id, Name: '', Units: 0, Price: 0, TotalConcept: 0 });
    }else{
      const itemName = this.detailsForm.controls['Item' + id].value;
      if (!itemName || itemName.trim() === '') {
        // No añadir si el producto está vacío
        return;
      }
      let units = parseFloat(this.detailsForm.controls['Units' + id].value);

      this.items[id].Name = itemName;
      this.items[id].Units = units;
      this.items[id].Price = parseFloat(this.lasItemAdded.Price);
      this.items[id].TotalConcept = Number((units * this.items[id].Price).toFixed(2));
  
      this.items.push({ Id: id + 1, Name: '', Units: 0, Price: 0, TotalConcept: 0 });

      this.filteredItems = this.detailsForm.controls[`Item${id}`].valueChanges.pipe(
        startWith(''),
        map(value => {
          const item = value;
          return item ? this._filter(item as string) : this.dbItems || '';
        }),
      );
    }
  }

  newFormControls(id: number) {
    this.detailsForm.addControl(`Item${id}`, new FormControl());
    this.detailsForm.addControl(`PriceTD${id}`, new FormControl());
    this.detailsForm.addControl(`Units${id}`, new FormControl());
  }

  changeSelection(id: number, name: string, event: any) {
    if (event.isUserInput) {
      this.lastOptionIdSelected = id;
      this._filter(name);
    }
  }

  private _filter(value: any): any[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.Item.toLowerCase();

    let itemSelected = this.dbItems.find((item: any) => item.Name === value)!;

    if (itemSelected !== undefined) {
      let priceElement = document.getElementById(`PriceTD${this.lastOptionIdSelected}`)! as HTMLInputElement;
      priceElement.value = itemSelected.Price;
    }

    this.lasItemAdded = itemSelected;

    return this.dbItems.filter((option: any) => option.Name.toLowerCase().includes(filterValue));
  }

  addItems() {
    this.addItem(this.items.length - 1, 'new');
    // Filtrar solo los productos con nombre y unidades válidas
    const itemsValidos = this.items.filter(item => {
      return item.Name && item.Name.trim() !== '' && item.Units > 0;
    });
    this.dialogRef.close({ data: itemsValidos });
  }

  unitsChange(idItem: number, event: any) {
    let refreshUnits = (event.target as HTMLInputElement).value

    this.items[idItem].Units = parseFloat(refreshUnits);
    this.items[idItem].TotalConcept = this.items[idItem].Units * this.items[idItem].Price;
  }
}

export class ItemInit {
  constructor(public id: number, public name: string, public price: number) {

  }
}