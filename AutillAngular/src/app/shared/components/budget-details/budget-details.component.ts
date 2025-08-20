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
  items: any[] = [];
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
    this.data.forEach(item => {
      this.newFormControls(item);
    });

    if (this.data && Array.isArray(this.data) && this.data.length > 0) {
      this.items = this.data.map((item: any) => ({ ...item, showDetails: false }));
    } else {
      this.items = [];
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
    });
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

  addItem(id: number, type: string) {
    if (type === 'form') {
      const itemName = this.detailsForm.controls['Item' + (id - 1)].value;
      if (!itemName || itemName.trim() === '') {
        return;
      }
      let units = parseFloat(this.detailsForm.controls['Units' + (id - 1)].value);
      let price = parseFloat(this.detailsForm.controls['PriceTD' + (id - 1)].value);

      const dbItem = this.dbItems.find((item: any) => item.Name === itemName);
      this.items[(id - 1)].Id = dbItem ? dbItem.Id : 0;
      this.items[(id - 1)].Name = dbItem ? dbItem.Name : itemName;
      this.items[(id - 1)].Units = units;
      this.items[(id - 1)].Price = dbItem ? parseFloat(dbItem.PriceImp) : price;
      this.items[(id - 1)].TotalConcept = Number((units * this.items[(id - 1)].Price).toFixed(2));
      this.newFormControls(id);
      // Solo añadir un nuevo producto vacío si el anterior tiene Name e Id válidos
      if (this.items[(id - 1)].Id > 0 && this.items[(id - 1)].Name) {
        this.items.push({ Id: 0, Name: '', Units: 0, Price: 0, TotalConcept: 0, showDetails: false });
      }
    } else {
      const itemName = this.detailsForm.controls['Item' + id].value;
      if (!itemName || itemName.trim() === '') {
        return;
      }
      let units = parseFloat(this.detailsForm.controls['Units' + id].value);
      let price = parseFloat(this.detailsForm.controls['PriceTD' + id].value);
      const dbItem = this.dbItems.find((item: any) => item.Name === itemName);
      this.items[id].Id = dbItem ? dbItem.Id : 0;
      this.items[id].Name = dbItem ? dbItem.Name : itemName;
      this.items[id].Units = units;
      this.items[id].Price = dbItem ? parseFloat(dbItem.PriceImp) : price;
      this.items[id].TotalConcept = Number((units * this.items[id].Price).toFixed(2));
      // Solo añadir un nuevo producto vacío si el anterior tiene Name e Id válidos
      if (this.items[id].Id > 0 && this.items[id].Name) {
        this.items.push({ Id: 0, Name: '', Units: 0, Price: 0, TotalConcept: 0, showDetails: false });
      }
      this.filteredItems = this.detailsForm.controls[`Item${id}`].valueChanges.pipe(
        startWith(''),
        map(value => {
          const item = value;
          return item ? this._filter(item as string) : this.dbItems || '';
        }),
      );
    }
  }

  newFormControls(item: any) {
    if (item.Id > 0) {
      this.detailsForm.addControl(`Item${item.Id}`, new FormControl(item.Name));
      this.detailsForm.addControl(`PriceTD${item.Id}`, new FormControl(item.Price));
      this.detailsForm.addControl(`Units${item.Id}`, new FormControl(item.Units));
      console.log(this.detailsForm);
    }

  }

  changeSelection(id: number, name: string, event: any) {
    if (event.isUserInput) {
      this.lastOptionIdSelected = id;
      const itemSelected = this.dbItems.find((item: any) => item.Name === name);

      if (itemSelected) {
        const prevId = this.items[id].Id;

        this.items[id].Id = itemSelected.Id;
        this.items[id].Name = itemSelected.Name;
        this.items[id].Price = itemSelected.PriceImp;

        if (prevId !== itemSelected.Id) {
          console.log(prevId + ' -- ' + itemSelected.Id);
          // Obtener los valores actuales
          /*const itemValue = this.detailsForm.get(`Item${prevId}`)?.value;
          const priceValue = this.detailsForm.get(`PriceTD${prevId}`)?.value;*/
          const unitsValue = this.detailsForm.get(`Units${prevId}`)?.value;

          console.log(itemSelected);
          this.detailsForm.addControl(`Item${itemSelected.Id}`, new FormControl(''));
          this.detailsForm.addControl(`PriceTD${itemSelected.Id}`, new FormControl(itemSelected.PriceImp));
          this.detailsForm.addControl(`Units${itemSelected.Id}`, new FormControl(unitsValue));
          // Actualizar el array items manteniendo el orden visual
          this.items[id] = { ...this.items[id], Id: itemSelected.Id, Name: itemSelected.Name, Price: itemSelected.PriceImp };
          this.items = [...this.items];
          // Eliminar controles antiguos después de actualizar el array y forzar re-render
          setTimeout(() => {
            this.detailsForm.removeControl(`Item${prevId}`);
            this.detailsForm.removeControl(`PriceTD${prevId}`);
            this.detailsForm.removeControl(`Units${prevId}`);
          });
        } else {
          this.detailsForm.get(`PriceTD${id}`)?.setValue(itemSelected.Price);
        }
      }
      this._filter(name);
    }
  }

  private _filter(value: any): any[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.Item.toLowerCase();

    let itemSelected = this.dbItems.find((item: any) => item.Name === value);
    if (itemSelected !== undefined) {
      if (this.items[this.lastOptionIdSelected]) {
        this.items[this.lastOptionIdSelected].Price = itemSelected.PriceImp;
        this.detailsForm.get(`PriceTD${this.lastOptionIdSelected}`)?.setValue(itemSelected.PriceImp);
      }
    }
    this.lasItemAdded = itemSelected;
    return this.dbItems.filter((option: any) => option.Name.toLowerCase().includes(filterValue));
  }

  addItems() {
    this.items.forEach(item => {
      console.log(item);
      /*const name = this.detailsForm.get(`Item${item.Id}`)?.value ?? item.Name;
      item.Name = name;*/
      if (item.Name && item.Name.trim() !== '' && item.Units > 0) {
        //let price = this.detailsForm.get(`PriceTD${item.Id}`)?.value ?? item.Price;
        let units = this.detailsForm.get(`Units${item.Id}`)?.value ?? item.Units;

        const dbItem = this.dbItems.find((db: any) => db.Id === item.Id);
        if (dbItem && dbItem.Stock > 0) {
          item.Stock = dbItem.Stock;
        }

        //item.PriceImp = parseFloat(price) || 0;
        item.Units = parseFloat(units) || 0;
        item.TotalConcept = Number((item.Units * item.Price).toFixed(2));
      }
    });
    const itemsValidos = this.items.filter(item => {
      return item.Id > 0 && item.Name && item.Name.trim() !== '' && item.Units > 0 && item.Price > 0;
    });
    this.dialogRef.close({ data: itemsValidos });
  }

  addAnotherProduct() {
    const newId = this.items.length > 0 ? Math.max(...this.items.map(i => i.Id)) + 1 : 0;

    if (this.items.length === 0) {
      this.items.push({ Id: newId, Name: '', Units: 0, Price: 0, TotalConcept: 0, showDetails: true });
      this.newFormControls(newId);
      this.detailsForm.get(`Item${newId}`)?.setValue('');
      return;
    }

    const existeVacio = this.items.some(item => !item.Name && item.Units === 0 && item.Price === 0);
    if (!existeVacio) {
      this.items.push({ Id: newId, Name: '', Units: 0, Price: 0, TotalConcept: 0, showDetails: true });
      this.newFormControls(newId);
      this.detailsForm.get(`Item${newId}`)?.setValue('');
    }
  }

  unitsChange(idItem: number, event: any) {
    let refreshUnits = event.target.value;
    const item = this.items.find(i => i.Id === idItem);

    if (item) {
      item.Units = parseFloat(refreshUnits);
      item.TotalConcept = item.Units * item.Price;
    }
  }

  hasEmptyItem(): boolean {
    return this.items.some(item => !item.Name && item.Units === 0 && item.PriceImp === 0);
  }
}

export class ItemInit {
  constructor(public id: number, public name: string, public price: number) {

  }
}