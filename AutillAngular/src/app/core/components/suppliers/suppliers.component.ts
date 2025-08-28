import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { DeleteItemModalComponent } from '../../../shared/components/delete-item-modal/delete-item-modal.component';
import { ClientsModalComponent } from '../../../shared/components/clients-modal/clients-modal.component';
import { ErrorsComponent } from '../../../shared/components/errors/errors.component';
import { ClientService } from '../../services/client.service';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { SearchFiltersComponent } from '../../../shared/components/search-filters/search-filters.component';
import { Messages } from '../../services/common-service.service';
import { SuppliersService } from '../../services/suppliers.service';
import { CategoryModalComponent } from '../../../shared/components/category-modal/category-modal.component';
import { Router } from '@angular/router';
import { SupplierModalComponent } from '../../../shared/components/supplier-modal/supplier-modal.component';
import { SpinnerLoadingComponent } from '../../../shared/components/spinner-loading/spinner-loading.component';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, ErrorsComponent, PaginatorComponent, SearchFiltersComponent, SpinnerLoadingComponent],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css'
})
export class SuppliersComponent {
  @Input() suppliers: any;

  dataScreen: string = 'suppliers'
  allSuppliers: any = [];
  showModal = false;
  showFilters = false;
  suppliersService = inject(SuppliersService);
  errorMessage: string = '';
  dataSuppliers: any = [];
  filtersActivated: any = null;
    loading: boolean = false;

  constructor(private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", null, 10, 0).subscribe({
      next: (data: any) => {
        this.allSuppliers = data;
        this.dataSuppliers = data;
        this.suppliers = data;
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

  updateItems(pagination: any) {
    this.loading = true;
    this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", null, 10, pagination.skip).subscribe((suppliers: any) => {
      this.allSuppliers = suppliers;
      this.dataSuppliers = suppliers;
      this.suppliers = suppliers;
      this.loading = false;
    })
  }

  updateSearching(formControlValue: any) {
    this.loading = true;
    if (formControlValue === "") {
      this.filtersActivated = null;
      this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", null, 10, 0).subscribe((suppliers: any) => {
        this.allSuppliers = suppliers;
        this.dataSuppliers = suppliers;
        this.suppliers = suppliers;
        this.loading = false;
      })
    } else {
      this.filtersActivated = formControlValue;
      this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", formControlValue, 10, 0).subscribe((filterBudgets: any) => {
        this.suppliers = filterBudgets;
        this.allSuppliers = this.suppliers;
        this.loading = false;
      });
    }
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
      if(action === 'view'){
        this.router.navigate(['/items'], { queryParams: { IdSupplier: supplier } });
      }else if (action === 'edit'){
      const dialogRef = this.dialog.open(SupplierModalComponent);
      dialogRef.componentInstance.action = 'edit';
      dialogRef.componentInstance.id = supplier;
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // do something
        }
      });
      }else{
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
