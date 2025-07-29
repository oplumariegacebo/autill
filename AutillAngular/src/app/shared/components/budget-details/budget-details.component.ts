import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
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
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, AsyncPipe, CommonModule],
  templateUrl: './budget-details.component.html',
  styleUrl: './budget-details.component.css'
})
export class BudgetDetailsComponent {
  removeItem(id: number) {
    // Elimina el producto del array items
    this.items = this.items.filter(item => item.Id !== id);
    // Elimina los controles del formulario asociados
    this.detailsForm.removeControl(`Item${id}`);
    this.detailsForm.removeControl(`PriceTD${id}`);
    this.detailsForm.removeControl(`Units${id}`);
  }
  items = [{ Id: 0, Name: '', Units: 0, Price: 0, TotalConcept: 0, showDetails: false }];
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
      // Añadir showDetails a cada item importado
      this.items = this.data.map((item: any) => ({ ...item, showDetails: false }));
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

      this.items.push({ Id: id, Name: '', Units: 0, Price: 0, TotalConcept: 0, showDetails: false });
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
  
      this.items.push({ Id: id + 1, Name: '', Units: 0, Price: 0, TotalConcept: 0, showDetails: false });

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
      const itemSelected = this.dbItems.find((item: any) => item.Name === name);
      if (itemSelected) {
        this.items[id].Price = itemSelected.Price;
        this.detailsForm.get(`PriceTD${id}`)?.setValue(itemSelected.Price);
      }
      this._filter(name);
    }
  }

  private _filter(value: any): any[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.Item.toLowerCase();

    let itemSelected = this.dbItems.find((item: any) => item.Name === value);
    if (itemSelected !== undefined) {
      if (this.items[this.lastOptionIdSelected]) {
        this.items[this.lastOptionIdSelected].Price = itemSelected.Price;
        this.detailsForm.get(`PriceTD${this.lastOptionIdSelected}`)?.setValue(itemSelected.Price);
      }
    }
    this.lasItemAdded = itemSelected;
    return this.dbItems.filter((option: any) => option.Name.toLowerCase().includes(filterValue));
  }

  addItems() {
    this.items.forEach(item => {
      if (item.Name && item.Name.trim() !== '' && item.Units > 0) {
        const price = this.detailsForm.get(`PriceTD${item.Id}`)?.value ?? item.Price;
        const units = this.detailsForm.get(`Units${item.Id}`)?.value ?? item.Units;
        item.Price = parseFloat(price) || 0;
        item.Units = parseFloat(units) || 0;
        item.TotalConcept = Number((item.Units * item.Price).toFixed(2));
      }
    });
    const itemsValidos = this.items.filter(item => {
      return item.Name && item.Name.trim() !== '' && item.Units > 0 && item.Price > 0;
    });
    this.dialogRef.close({ data: itemsValidos });
  }

  addAnotherProduct() {
    const newId = this.items.length > 0 ? Math.max(...this.items.map(i => i.Id)) + 1 : 0;
    this.items.push({ Id: newId, Name: '', Units: 0, Price: 0, TotalConcept: 0, showDetails: true });
    this.newFormControls(newId);
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