import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { filter, map, Observable, startWith } from 'rxjs';
import { Client } from '../../../core/models/Client';
import { ClientService } from '../../../core/services/client.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Supplier } from '../../../core/models/Supplier';
import { Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/Category';
import { ItemService } from '../../../core/services/item.service';
import { Item } from '../../../core/models/Item';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL'
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY'
  }
};

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatAutocompleteModule, AsyncPipe, MatDatepickerModule],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  templateUrl: './search-filters.component.html',
  styleUrl: './search-filters.component.css'
})
export class SearchFiltersComponent {
  @Input() dataScreen: string = '';
  @Output() updateSearching = new EventEmitter<any>();

  searchForm!: FormGroup
  clientService = inject(ClientService);
  suppliersService = inject(SuppliersService);
  categoriesService = inject(CategoryService);
  itemsService = inject(ItemService);
  clients: any = [];
  filteredClients!: Observable<Client[]>;
  suppliers: any = [];
  filteredSuppliers!: Observable<Supplier[]>;
  categories: any = [];
  filteredCategories!: Observable<Category[]>;
  items: any = [];
  filteredItems!: Observable<Item[]>;

  initializeForm() {
    this.searchForm = new FormGroup({
      Name: new FormControl(''),
      Date: new FormControl(null),
      Cashed: new FormControl(''),
      CloseIt: new FormControl(''),
      PriceMin: new FormControl(''),
      PriceMax: new FormControl('')
    })
  }

  constructor(private router: Router) {
    this.initializeForm();
  }

  ngOnInit() {
    if (this.dataScreen === 'suppliers') {
      this.searchForm.addControl('SupplierId', new FormControl(''));
      this.searchForm.addControl('Nif', new FormControl(''));
      this.searchForm.addControl('PhoneNumber', new FormControl(''));
      this.suppliersService.getAllSuppliers(localStorage.getItem('id') || "[]").subscribe((suppliers: any) => {
        this.suppliers = suppliers.data;

        this.filteredSuppliers = this.searchForm.controls['SupplierId'].valueChanges.pipe(
          startWith(''),
          map(value => this._filterByName(value, this.suppliers))
        );
      })
    } else if (this.dataScreen === 'clients') {
      this.searchForm.addControl('ClientId', new FormControl(''));
      this.searchForm.addControl('Nif', new FormControl(''));
      this.searchForm.addControl('PhoneNumber', new FormControl(''));
      this.clientService.getAllClients(localStorage.getItem('id') || "[]").subscribe((clients: any) => {
        this.clients = clients.data;

        this.filteredClients = this.searchForm.controls['ClientId'].valueChanges.pipe(
          startWith(''),
          map(value => this._filterByName(value, this.clients))
        );
      })
    } else if (this.dataScreen === 'items') {
      this.searchForm.addControl('IdCategory', new FormControl(''));
      this.categoriesService.getAllCategories(localStorage.getItem('id') || "[]").subscribe((categories: any) => {
        this.categories = categories.data;

        this.filteredCategories = this.searchForm.controls['IdCategory'].valueChanges.pipe(
          startWith(''),
          map(value => this._filterByName(value, this.categories))
        );
      })
    } else if (this.dataScreen === 'budgets' || this.dataScreen === 'bills') {
      this.searchForm.addControl('ClientId', new FormControl(''));
      this.clientService.getAllClients(localStorage.getItem('id') || "[]").subscribe((clients: any) => {
        this.clients = clients.data;

        this.filteredClients = this.searchForm.controls['ClientId'].valueChanges.pipe(
          startWith(''),
          map(value => this._filterByName(value, this.clients))
        );
      })
    }
  }

  search() {
    const formValue = { ...this.searchForm.value };

    if (formValue.ClientId && typeof formValue.ClientId === 'object') {
      formValue.ClientId = formValue.ClientId.Id;
    }
    if (formValue.SupplierId && typeof formValue.SupplierId === 'object') {
      formValue.SupplierId = formValue.SupplierId.Id;
    }
    if (formValue.IdCategory && typeof formValue.IdCategory === 'object') {
      formValue.IdCategory = formValue.IdCategory.Id;
    }

    this.updateSearching.emit(formValue);
  }

  displayFn(item: { Name: string }): string {
    return item && item.Name ? item.Name : '';
  }

  reset() {
    this.searchForm.reset();
    this.router.navigate([], { queryParams: {} });
    this.updateSearching.emit("");
  }

  private _filterByName(value: string | { Name: string } | null, sourceArray: any[]): any[] {
    const filterValue = (typeof value === 'string' ? value : value?.Name || '').toLowerCase();
    return sourceArray.filter(option => option.Name.toLowerCase().includes(filterValue));
  }
}
