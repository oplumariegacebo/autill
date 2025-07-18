import { Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { DeleteItemModalComponent } from '../../../shared/components/delete-item-modal/delete-item-modal.component';
import { ClientsModalComponent } from '../../../shared/components/clients-modal/clients-modal.component';
import { ErrorsComponent } from '../../../shared/components/errors/errors.component';
import { ClientService } from '../../services/client.service';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { SearchFiltersComponent } from '../../../shared/components/search-filters/search-filters.component';
import { Messages } from '../../services/common-service.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [ErrorsComponent, PaginatorComponent, SearchFiltersComponent],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent {
  @Input() clients: any;

  dataScreen: string = 'clients'
  allClients:any = [];
  showModal = false;
  clientService = inject(ClientService);
  errorMessage: string = '';
  dataClients: any = [];
  filtersActivated: any = null;

  constructor(private dialog: MatDialog){}

  ngOnInit() {
    this.clientService.getClients(localStorage.getItem('id') || "[]", null, 10, 0).subscribe({
      next: (data:any) => {
        this.allClients = data;
        this.dataClients = data;
        this.clients = data;
      }, 
      error: (err: HttpErrorResponse) => {
        let error = '';
        if(err.status === 500){
          error = 'Internal server error.'
        }else if(err.status === 401){
          error = 'No autorizado.'
        }else{
          error = 'Ha ocurrido un error, contacta con el administrador.'
        }
        this.errorMessage = error;
      }
    })
  }

  updateItems(pagination: any){
    this.clientService.getClients(localStorage.getItem('id') || "[]", null, 10, pagination.skip).subscribe((clients:any) => {
      this.allClients = clients;
      this.dataClients = clients;
      this.clients = clients;
    })
  }

  updateSearching(formControlValue: any){
    if(formControlValue === ""){
      this.filtersActivated = null;
      this.clientService.getClients(localStorage.getItem('id') || "[]", null, 10, 0).subscribe((clients:any) => {
        this.allClients = clients;
        this.dataClients = clients;
        this.clients = clients;
      })
    }else{
      this.filtersActivated  = formControlValue;
      this.clientService.getClients(localStorage.getItem('id') || "[]", formControlValue, 10, 0).subscribe((filterBudgets: any) => {
        this.clients = filterBudgets;
        this.allClients = this.clients;
      });
    }
  }

  deleteClient(id: number){
    const dialogRef = this.dialog.open(DeleteItemModalComponent);
    dialogRef.componentInstance.type = 'cliente';
    dialogRef.componentInstance.title = Messages.DELETE_CLIENT_TITLE;
    dialogRef.componentInstance.message = Messages.DELETE_CLIENT_MSG;
    dialogRef.componentInstance.id = id;

    dialogRef.afterClosed().subscribe(result => {
      if(result == 'confirm'){
        this.clientService.deleteClient(id).subscribe({
        })
      }
    })
  }

  openTaskDialog(id: number) {
    const dialogRef = this.dialog.open(ClientsModalComponent);
    dialogRef.componentInstance.id = id;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do something
      }
    });
  }
}
