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

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, ErrorsComponent, PaginatorComponent, SearchFiltersComponent],
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

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", null, 10, 0).subscribe({
      next: (data: any) => {
        this.allSuppliers = data;
        this.dataSuppliers = data;
        this.suppliers = data;
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
      }
    })
  }

  updateItems(pagination: any) {
    this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", null, 10, pagination.skip).subscribe((suppliers: any) => {
      this.allSuppliers = suppliers;
      this.dataSuppliers = suppliers;
      this.suppliers = suppliers;
    })
  }

  updateSearching(formControlValue: any) {
    if (formControlValue === "") {
      this.filtersActivated = null;
      this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", null, 10, 0).subscribe((suppliers: any) => {
        this.allSuppliers = suppliers;
        this.dataSuppliers = suppliers;
        this.suppliers = suppliers;
      })
    } else {
      this.filtersActivated = formControlValue;
      this.suppliersService.getSuppliers(localStorage.getItem('id') || "[]", formControlValue, 10, 0).subscribe((filterBudgets: any) => {
        this.suppliers = filterBudgets;
        this.allSuppliers = this.suppliers;
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

  openTaskDialog(id: number) {
    const dialogRef = this.dialog.open(ClientsModalComponent);
    dialogRef.componentInstance.action = 'supp';
    dialogRef.componentInstance.id = id;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do something
      }
    });
  }
}
