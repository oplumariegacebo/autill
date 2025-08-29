import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeleteItemModalComponent } from '../../../shared/components/delete-item-modal/delete-item-modal.component';
import { ErrorsComponent } from '../../../shared/components/errors/errors.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { SearchFiltersComponent } from '../../../shared/components/search-filters/search-filters.component';
import { Messages } from '../../services/common-service.service';
import { SuppliersService } from '../../services/suppliers.service';
import { Router } from '@angular/router';
import { SupplierModalComponent } from '../../../shared/components/supplier-modal/supplier-modal.component';
import { SpinnerLoadingComponent } from '../../../shared/components/spinner-loading/spinner-loading.component';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, ErrorsComponent, PaginatorComponent, SearchFiltersComponent, SpinnerLoadingComponent],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css'
})
export class SuppliersComponent implements OnDestroy {
  @Input() suppliers: any;

  dataScreen: string = 'suppliers'
  allSuppliers: any = [];
  showModal = false;
  showFilters = false;
  suppliersService = inject(SuppliersService);
  itemService = inject(ItemService);
  errorMessage: string = '';
  dataSuppliers: any = [];
  filtersActivated: any = null;
  loading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", null, 10, 0).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.allSuppliers = data;
        this.dataSuppliers = data;
        this.suppliers = data;

        this.checkStockLimitItems();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        let error = '';
        if (err.status === 500) {
          error = 'Internal server error.'
        } else if (err.status === 401) {
          error = 'No autorizado.'
        } else {
          error = 'Ha ocurrido un error, contacta con el administrador.'
        }
        this.errorMessage = error;
        this.loading = false;
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkStockLimitItems() {
    const userId = localStorage.getItem('id') || "[]";
    if (!this.suppliers?.data?.length) {
      return;
    }

    this.suppliers.data.forEach((s: any) => s.StockUnder = false);

    this.itemService.getItems(userId, { 'StockLimit': true }, 9999, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (itemsResponse: any) => {
          if (itemsResponse?.data?.length > 0) {
            const lowStockSupplierIds = new Set(itemsResponse.data.map((item: any) => item.IdSupplier));

            this.suppliers.data.forEach((supplier: any) => {
              supplier.StockUnder = lowStockSupplierIds.has(supplier.Id);
            });
          }
        },
        error: (err) => {
          console.error('Error al verificar el stock de los items:', err);
        }
      });
  }

  updateItems(pagination: any) {
    this.loading = true;
    this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", this.filtersActivated, 10, pagination.skip)
      .pipe(takeUntil(this.destroy$))
      .subscribe((suppliers: any) => {
        this.allSuppliers = suppliers;
        this.dataSuppliers = suppliers;
        this.suppliers = suppliers;
        this.checkStockLimitItems();
        this.loading = false;
      })
  }

  updateSearching(formControlValue: any) {
    this.loading = true;
    this.filtersActivated = formControlValue === "" ? null : formControlValue;
    this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", this.filtersActivated, 10, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe((filteredSuppliers: any) => {
        this.suppliers = filteredSuppliers;
        this.allSuppliers = this.suppliers;
        if (!this.filtersActivated) {
          this.dataSuppliers = filteredSuppliers;
        }
        this.checkStockLimitItems();
        this.loading = false;
      });
  }

  deleteSupplier(id: number) {
    const dialogRef = this.dialog.open(DeleteItemModalComponent);
    dialogRef.componentInstance.type = 'proveedor';
    dialogRef.componentInstance.title = Messages.DELETE_SUPPLIER_TITLE;
    dialogRef.componentInstance.message = Messages.DELETE_SUPPLIER_MSG;
    dialogRef.componentInstance.id = id;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'confirm') {
        this.suppliersService.deleteSupplier(id).subscribe({
          next: () => {
            window.location.reload();
          },
          error: (err) => {
            alert('Error al eliminar el proveedor');
          }
        });
      }
    })
  }

  openTaskDialog(action: string, supplier: any) {
    if (action === 'view') {
      this.router.navigate(['/items'], { queryParams: { IdSupplier: supplier } });
    } else if (action === 'edit') {
      const dialogRef = this.dialog.open(SupplierModalComponent);
      dialogRef.componentInstance.action = 'edit';
      dialogRef.componentInstance.id = supplier;

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
        }
      });
    } else if (action === 'stockLimitView') {
      this.router.navigate(['/items'], { queryParams: { panel: 'stockLimit', IdSupplier: supplier } });
    }
    else {
      const dialogRef = this.dialog.open(SupplierModalComponent);
      dialogRef.componentInstance.action = 'add';

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // do something
        }
      });
    }
  }
}
