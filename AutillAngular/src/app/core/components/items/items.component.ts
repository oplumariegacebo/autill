import { Component, inject, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { DeleteItemModalComponent } from '../../../shared/components/delete-item-modal/delete-item-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ItemModalComponent } from '../../../shared/components/item-modal/item-modal.component';
import { ErrorsComponent } from '../../../shared/components/errors/errors.component';
import { ItemService } from '../../services/item.service';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { SearchFiltersComponent } from '../../../shared/components/search-filters/search-filters.component';
import { CommonService, Messages } from '../../services/common-service.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SpinnerLoadingComponent } from '../../../shared/components/spinner-loading/spinner-loading.component';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, ErrorsComponent, PaginatorComponent, SearchFiltersComponent, SpinnerLoadingComponent],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css'
})
export class ItemsComponent {
  dataScreen: string = 'items'
  showModal = false;
  showFilters = false;
  itemService = inject(ItemService);
  commonService = inject(CommonService);
  errorMessage: string = '';
  allItems: any = [];
  items: any;
  loading: boolean = false;
  panel: string = '';

  private destroy$ = new Subject<void>();
  private categoryFilter: { IdCategory: string } | null = null;
  private supplierFilter: { IdSupplier: string } | null = null;
  private searchFilter: any = null;

  displayedColumns: string[] = ['name', 'price', 'actions'];

  constructor(private dialog: MatDialog, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const categoryId = params['categoryId'];
        const supplierId = params['IdSupplier'];
        const panel = params['panel'];
        if(panel === 'stockLimit'){
          this.panel = panel;
        }
        this.categoryFilter = categoryId ? { IdCategory: categoryId } : null;
        this.supplierFilter = supplierId ? { IdSupplier: supplierId } : null;
        this.fetchItems();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchItems(skip: number = 0): void {
    this.loading = true;
    const finalFilters = { ...this.categoryFilter, ...this.supplierFilter, ...this.searchFilter };
    if(this.panel === 'stockLimit'){
      finalFilters['StockLimit'] = true;
    }

    const userId = localStorage.getItem('id') || "[]";
    const filtersToSend = Object.keys(finalFilters).length > 0 ? finalFilters : null;

    this.itemService.getItems(userId, filtersToSend, 10, skip)
      .pipe(takeUntil(this.destroy$))
      .subscribe((items: any) => {
        this.allItems = items;
        this.items = items;
        this.loading = false;
      });
  }

  openTaskDialog(action: string, item: Object) {
    const dialogRef = this.dialog.open(ItemModalComponent);
    dialogRef.componentInstance.item = item;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do something
      }
    });
  }

  updateItems(pagination: any) {
    this.fetchItems(pagination.skip);
  }

  updateSearching(formControlValue: any) {
    this.searchFilter = (formControlValue === "" || formControlValue === null) ? null : formControlValue;
    this.fetchItems();
  }

  deleteItem(id: number) {
    const dialogRef = this.dialog.open(DeleteItemModalComponent);
    dialogRef.componentInstance.type = 'producto';
    dialogRef.componentInstance.title = Messages.DELETE_ITEM_TITLE;
    dialogRef.componentInstance.message = Messages.DELETE_ITEM_MSG;
    dialogRef.componentInstance.id = id;

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.fetchItems(); // Re-fetch items to reflect the deletion
      }
    });
  }
}