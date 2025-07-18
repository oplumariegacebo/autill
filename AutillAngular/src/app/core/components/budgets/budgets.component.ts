import { Component, inject, Input, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BudgetModalComponent } from '../../../shared/components/budget-modal/budget-modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorsComponent } from "../../../shared/components/errors/errors.component";
import { DeleteItemModalComponent } from '../../../shared/components/delete-item-modal/delete-item-modal.component';
import { CommonService, Messages } from '../../services/common-service.service';
import { BudgetService } from '../../services/budget.service';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { SearchFiltersComponent } from "../../../shared/components/search-filters/search-filters.component";
import { UserService } from '../../services/user.service';
import { ClientService } from '../../services/client.service';
import { SendEmailComponent } from '../../../shared/components/send-email/send-email.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [ErrorsComponent, PaginatorComponent, SearchFiltersComponent],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.css'
})
export class BudgetsComponent {
  @Input() budgets: any;

  dataScreen: string = 'budgets';
  allBudgets: any = [];
  dataBudgets: any = [];
  showModal = false;
  apiService = inject(ApiService);
  budgetService = inject(BudgetService);
  userService = inject(UserService);
  clientService = inject(ClientService);
  errorMessage: string = '';
  filtersActivated: any = null;

  constructor(private dialog: MatDialog, public commonService: CommonService) { }

  ngOnInit() {
    this.budgetService.getBudgets(localStorage.getItem('id') || "[]", null, 10, 0).subscribe({
      next: (data: any) => {
        this.allBudgets = data;
        this.dataBudgets = data;
        this.budgets = data;
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
    this.budgetService.getBudgets(localStorage.getItem('id') || "[]", this.filtersActivated, 10, pagination.skip).subscribe((budgets: any) => {
      this.allBudgets = budgets;
      this.dataBudgets = budgets;
      this.budgets = budgets;
    })
  }

  updateSearching(formControlValue: any) {
    if(formControlValue === ""){
      this.filtersActivated = null;
      this.budgetService.getBudgets(localStorage.getItem('id') || "[]", null, 10, 0).subscribe((budgets:any) => {
        this.allBudgets = budgets;
        this.dataBudgets = budgets;
        this.budgets = budgets;
      })
    }else{
      if (formControlValue.Date != null) {
        formControlValue.Date = this.commonService.transformDate(formControlValue.Date);
      }
  
      this.filtersActivated  = formControlValue;
      this.budgetService.getBudgets(localStorage.getItem('id') || "[]", formControlValue, 10, 0).subscribe((filterBudgets: any) => {
        this.budgets = filterBudgets;
        this.allBudgets = this.budgets;
      });
    }
  }

  openTaskDialog(action: string, id: number) {
    const dialogRef = this.dialog.open(BudgetModalComponent);
    dialogRef.componentInstance.id = id;
    dialogRef.componentInstance.action = action;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do something
      }
    });
  }

  deleteBudget(id: number) {
    const dialogRef = this.dialog.open(DeleteItemModalComponent);
    dialogRef.componentInstance.type = 'presupuesto';
    dialogRef.componentInstance.title = Messages.DELETE_BUDGET_TITLE;
    dialogRef.componentInstance.message = Messages.DELETE_BUDGET_MSG;
    dialogRef.componentInstance.id = id;

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'confirm') {
        this.budgetService.deleteBudget(id).subscribe({
        })
      }
    })
  }

  sendEmail(budget: any) {
    this.userService.getUserById(localStorage.getItem('id')).subscribe((user: any) => {
      this.clientService.getClientById(budget.ClientId).subscribe((client: any) => {
        const dialogRef = this.dialog.open(SendEmailComponent);
        dialogRef.componentInstance.message = Messages.SEND_EMAIL + client.Email + '?';
        dialogRef.componentInstance.client = client;
        dialogRef.componentInstance.user = user;
        dialogRef.componentInstance.budget = budget;
      })
    })
  }

}