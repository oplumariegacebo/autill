import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MatAutocompleteModule } from '@angular/material/autocomplete';
// import { MatSelectModule } from '@angular/material/select';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { Item } from '../../../core/models/Item';
import { ItemService } from '../../../core/services/item.service';
import { CategoryService } from '../../../core/services/category.service';


interface BudgetItem {
  Id: number;
  Name: string;
  Ref: string;
  Units: number;
  Price: number;
  TotalConcept: number;
  showDetails: boolean;
  Category: number;
  filteredItems: Observable<Item[]>;
  displayName: string;
  PriceImp: number;
  Stock?: number;
}

@Component({
  selector: 'app-budget-details',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AsyncPipe, CommonModule],
  templateUrl: './budget-details.component.html',
  styleUrl: './budget-details.component.css'
})
export class BudgetDetailsComponent {
  items: BudgetItem[] = [];
  ivaExento: boolean = false;
  data = [];
  dbItems: any = [];
  itemService = inject(ItemService);
  categoryService = inject(CategoryService);
  private _nextId = 0;
  detailsForm!: FormGroup;
  nameDefault: string = '';
  disabledCreate: boolean = false;
  categories: any = [];
  userId = localStorage.getItem('id') || "[]";
  showSuggestions: boolean[] = [];

  onProductInput(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const itemControl = this.itemsControls.at(index).get('Item');
    if (itemControl) {
      itemControl.setValue(inputElement.value);
    }
    this.showSuggestions[index] = true;
  }

  hideSuggestions(index: number) {
    // Delay hiding to allow click event on suggestions to register
    setTimeout(() => {
      this.showSuggestions[index] = false;
    }, 100);
  }

  selectProduct(index: number, selectedItem: Item) {
    const itemIndex = this.items.findIndex(i => i.Id === this.items[index].Id);
    const formGroup = this.itemsControls.at(itemIndex);

    if (itemIndex === -1) {
      console.warn(`Could not find item with id ${this.items[index].Id} to update. This may be a timing issue.`);
      return;
    }

    const newPrice = this.ivaExento ? parseFloat(selectedItem.Price.toString()) : parseFloat(selectedItem.PriceImp.toString());

    // Update the data model (BudgetItem)
    const updatedItem = this.items[itemIndex];
    updatedItem.Id = selectedItem.Id;
    updatedItem.Name = selectedItem.Name;
    updatedItem.Stock = selectedItem.Stock;
    updatedItem.Ref = selectedItem.Ref || '';
    updatedItem.Category = selectedItem.IdCategory;
    updatedItem.Price = newPrice;
    updatedItem.PriceImp = selectedItem.PriceImp;
    updatedItem.displayName = selectedItem.displayName?.toString() || '';

    // Update the form model (FormGroup in FormArray)
    formGroup.patchValue({
      internalId: selectedItem.Id,
      Item: selectedItem.displayName,
      PriceTD: newPrice,
      Category: selectedItem.IdCategory
    });

    this.hideSuggestions(index);
  }

  get itemsControls() {
    return this.detailsForm.get('items') as FormArray;
  }

  constructor(
    public dialogRef: MatDialogRef<BudgetDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public injectedData: any,
    private fb: FormBuilder
  ) {
    this.detailsForm = this.fb.group({
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    if (this.injectedData) {
      this.data = this.injectedData.data || [];
      this.dbItems = this.injectedData.dbItems?.data || [];
      this.ivaExento = this.injectedData.ivaExento;
    }

    this.itemService.getAllItems(this.userId).subscribe((data: any) => {
      this.dbItems = data.data.map((item: any) => ({
        ...item,
        displayName: item.Ref ? `${item.Ref} - ${item.Name}` : item.Name
      }));

      /*const categorySet = new Set<string>();
      this.dbItems.forEach((item: any) => {
        if (item.Category) {
          categorySet.add(item.Category);
        }
      });
      this.categories = [...categorySet].sort();*/

      this.categoryService.getAllCategories(this.userId).subscribe((data: any) => {
        this.categories = data.data;
      });

      if (this.data && Array.isArray(this.data) && this.data.length > 0) {
        this.items = this.data.map((item: any) => {
          const dbItem = this.dbItems.find((db: any) => db.Id === item.Id);
          const price = this.ivaExento
            ? (dbItem ? dbItem.Price : item.Price)
            : (dbItem ? dbItem.PriceImp : item.PriceImp);

          const newItem: BudgetItem = {
            ...item,
            displayName: item.Ref ? `${item.Ref} - ${item.Name}` : item.Name,
            showDetails: false,
            PriceImp: dbItem ? dbItem.PriceImp : item.PriceImp,
            Price: dbItem ? dbItem.Price : item.Price,
            Units: item.Units,
            filteredItems: new Observable<Item[]>()
          };
          return newItem;
        });

        this.items.forEach(item => {
          const dbItem = this.dbItems.find((db: any) => db.Id === item.Id);
          const price = this.ivaExento
            ? (dbItem ? dbItem.Price : item.Price)
            : (dbItem ? dbItem.PriceImp : item.PriceImp);
          this.addFormGroupForItem(item, price);
          this.setupFilteredItems(item);
        });
        this.showSuggestions = Array(this.items.length).fill(false);

      } else {
        this.items = [];
        this.showSuggestions = [];
      }

    });
  }

  ngAfterViewInit() { }

  onClose(): void {
    const itemsValidos = this.items.filter(item => {
      return item.Name && item.Name.trim() !== '' && item.Units > 0;
    });
    this.dialogRef.close({ data: itemsValidos });
  }

  private addFormGroupForItem(item: BudgetItem, price?: number) {
    const formGroup = this.fb.group({
      internalId: [item.Id], // Keep track of our BudgetItem Id
      Category: [item.Category || 0],
      Item: [item.displayName],
      Units: [item.Units],
      PriceTD: [price ?? item.Price]
    });
    this.itemsControls.push(formGroup);
  }

  addItems() {
    this.items.forEach(item => {
      if (item.Name && item.Name.trim() !== '' && item.Units > 0) {
        let units = this.itemsControls.controls.find(c => c.value.internalId === item.Id)?.get('Units')?.value ?? item.Units;
        const dbItem = this.dbItems.find((db: any) => db.Id === item.Id);
        if (dbItem) {
          if (dbItem.Stock > 0) {
            item.Stock = dbItem.Stock;
          }

          if (dbItem.Ref) {
            item.Ref = dbItem.Ref;
          }
        }
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
    const newId = --this._nextId;
    const newItem: BudgetItem = {
      Id: newId, Name: '', Ref: '', Units: 0, Price: 0, TotalConcept: 0, showDetails: true, Category: 0, displayName: '', PriceImp: 0,
      filteredItems: new Observable<Item[]>()
    };

    const existeVacio = this.items.some(item => !item.Name && item.Units === 0 && item.Price === 0);
    if (!existeVacio) {
      this.items.push(newItem);
      this.addFormGroupForItem(newItem);
      this.setupFilteredItems(newItem);
      this.showSuggestions.push(false);
    }
  }

  unitsChange(idItem: number, event: any) {
    let refreshUnits = event.target.value;

    const item = this.items.find(i => i.Id == idItem);

    if (item) {
      item.Units = parseFloat(refreshUnits);
      item.TotalConcept = item.Units * item.Price;
      if (item.Stock) {
        if (item.Units > item.Stock || item.Stock <= 0) {
          this.disabledCreate = true;
        }
      }
    }
  }

  hasEmptyItem(): boolean {
    return this.items.some(item => !item.Name && item.Units === 0 && item.Price === 0);
  }

  removeItem(id: number) {
    const itemIndex = this.items.findIndex(item => item.Id === id);
    if (itemIndex > -1) {
      this.items.splice(itemIndex, 1);
      this.itemsControls.removeAt(itemIndex);
    }
  }

  private setupFilteredItems(item: any) {
    const itemIndex = this.items.findIndex(i => i.Id === item.Id);
    const formGroup = this.itemsControls.at(itemIndex);
    if (!formGroup) return;

    const itemControl = formGroup.get('Item');
    const categoryControl = formGroup.get('Category');
    if (itemControl && categoryControl) {
      item.filteredItems = combineLatest([
        itemControl.valueChanges.pipe(startWith(itemControl.value || '')),
        categoryControl.valueChanges.pipe(startWith(categoryControl.value || ''))
      ]).pipe(
        map(([itemValue, categoryValue]) => this._filter(itemValue, categoryValue))
      );
    }
  }

  private _filter(value: any, category: string | null): any[] {
    const filterValue = (typeof value === 'string' ? value : (value.displayName || '')).toLowerCase();
    const itemsByCategory = category ? this.dbItems.filter((option: any) => option.IdCategory === Number(category)) : this.dbItems;
    return itemsByCategory.filter((option: any) => option.displayName.toLowerCase().includes(filterValue));
  }

}

export class ItemInit {
  constructor(public id: number, public name: string, public price: number) {

  }
}