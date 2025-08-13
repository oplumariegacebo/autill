import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DeleteItemModalComponent } from '../../../shared/components/delete-item-modal/delete-item-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonService, Messages } from '../../services/common-service.service';
import { BillService } from '../../services/bill.service';
import { ClientService } from '../../services/client.service';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { SearchFiltersComponent } from '../../../shared/components/search-filters/search-filters.component';
import { SpinnerLoadingComponent } from '../../../shared/components/spinner-loading/spinner-loading.component';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, PaginatorComponent, SearchFiltersComponent, SpinnerLoadingComponent],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsComponent {
  @Input() bills: any;

  dataScreen: string = 'bills';
  allBills: any = [];
  billService = inject(BillService);
  clientService = inject(ClientService);
  errorMessage: string = "";
  dataBills: any = [];
  filtersActivated: any = null;
  showFilters = false;
  loading: boolean = false;

  constructor(public dialog: MatDialog, public commonService: CommonService) { }

  ngOnInit() {
    this.loading = true;
    this.billService.getBills(localStorage.getItem('id') || "[]", null, 10, 0).subscribe({
      next: (data: any) => {
        for (let i = 0; i < data.data.length; i++) {
          this.clientService.getAllClients(localStorage.getItem('id') || "[]").subscribe((clients: any) => {
            for (let x = 0; x < clients.data.length; x++) {
              if (clients.data[x].Id === data.data[i].ClientId) {
                data.data[i].ClientName = clients.data[x].Name;
              }
            }
          })
        }
        this.allBills = data;
        this.dataBills = data;
        this.bills = data;
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
    this.billService.getBills(localStorage.getItem('id') || "[]", this.filtersActivated, 10, pagination.skip).subscribe({
      next: (bills: any) => {
        this.allBills = bills;
        this.dataBills = bills;
        this.bills = bills;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  cashed(id: number) {
    this.loading = true;
    this.billService.cashed(id).subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error al marcar como cobrada.';
        this.loading = false;
      }
    });
  }

  updateSearching(formControlValue: any) {
    this.loading = true;
    if (formControlValue === "") {
      this.filtersActivated = null;
      this.billService.getBills(localStorage.getItem('id') || "[]", null, 10, 0).subscribe({
        next: (bills: any) => {
          this.allBills = bills;
          this.dataBills = bills;
          this.bills = bills;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      if (formControlValue.Date != null) {
        formControlValue.Date = this.commonService.transformDate(formControlValue.Date);
      }
      this.filtersActivated = formControlValue;
      this.billService.getBills(localStorage.getItem('id') || "[]", formControlValue, 10, 0).subscribe({
        next: (filterBills: any) => {
          this.bills = filterBills;
          this.allBills = this.bills;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  openTaskDialog(n: string, id: number) {

  }

  deleteBill(id: number) {
    const dialogRef = this.dialog.open(DeleteItemModalComponent);
    dialogRef.componentInstance.type = 'factura';
    dialogRef.componentInstance.title = Messages.DELETE_BILL_TITLE;
    dialogRef.componentInstance.message = Messages.DELETE_BILL_MSG;
    dialogRef.componentInstance.id = id;

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.bills.data = this.bills.data.filter((i: any) => i.Id !== id);
        this.allBills.data = this.allBills.data.filter((i: any) => i.Id !== id);
        this.dataBills.data = this.dataBills.data.filter((i: any) => i.Id !== id);
      }
    })
  }
}
