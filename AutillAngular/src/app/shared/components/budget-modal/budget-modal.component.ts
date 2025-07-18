import { Component, computed, inject, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BudgetDetailsComponent } from '../budget-details/budget-details.component';
import { Router } from '@angular/router';
import moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { BudgetService } from '../../../core/services/budget.service';
import { map, Observable, startWith } from 'rxjs';
import { Client } from '../../../core/models/Client';
import { AsyncPipe } from '@angular/common';
import { ClientService } from '../../../core/services/client.service';
import { BillService } from '../../../core/services/bill.service';
import { ItemService } from '../../../core/services/item.service';
import { UserService } from '../../../core/services/user.service';
import { SpinnerLoadingComponent } from '../spinner-loading/spinner-loading.component';
import { MatDatepickerInput, MatDatepickerModule } from '@angular/material/datepicker';

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
  selector: 'app-budget-modal',
  standalone: true,
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, AsyncPipe, SpinnerLoadingComponent, MatDatepickerModule],
  templateUrl: './budget-modal.component.html',
  styleUrl: './budget-modal.component.css'
})


export class BudgetModalComponent {
  budgetForm!: FormGroup
  err: any | null;
  loading: boolean = false;
  clients: any = [];
  apiService = inject(ApiService);
  budgetService = inject(BudgetService);
  billService = inject(BillService);
  clientService = inject(ClientService);
  itemService = inject(ItemService);
  userService = inject(UserService);
  id!: number;
  nextName!: string;
  modalItemsArray = [];
  action: string = '';
  dbItems = [];
  filteredClients!: Observable<Client[]>;
  clientSelected: any;

  initializeForm() {
    this.budgetForm = new FormGroup({
      Id: new FormControl(),
      IdBusiness: new FormControl(localStorage.getItem('id') || "[]"),
      Name: new FormControl(),
      Price: new FormControl(),
      DescriptionItems: new FormControl(),
      ClientId: new FormControl(),
      ClientName: new FormControl(),
      Date: new FormControl(),
      CloseIt: new FormControl(false)
    })
  }

  constructor(public dialogRef: MatDialogRef<BudgetModalComponent>, private dialog: MatDialog, private router: Router) {
    this.initializeForm();
  }

  ngOnInit() {
    if (this.id > 0) {
      this.budgetService.getBudgetById(this.id).subscribe((budget: any) => {
        var dateParts = budget.Date.split("/");
        var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        budget.Date = dateObject;

        this.budgetForm.setValue(budget);
        this.budgetForm.controls['ClientId'].setValue(budget.ClientName);

        this.modalItemsArray = JSON.parse(budget.DescriptionItems);
      })
    } else {
      this.budgetService.nextBudgetName(localStorage.getItem('id') || "[]").subscribe((name: any) => {
        this.budgetForm.controls['Name'].setValue(name.name);
      })
    }
    this.clientService.getAllClients(localStorage.getItem('id') || "[]").subscribe((clients: any) => {
      this.clients = clients.data;

      this.filteredClients = this.budgetForm.controls['ClientId'].valueChanges.pipe(
        startWith(''),
        map(value => {
          const item = value;
          return item ? this._filter(item as string) : clients.data || '';
        }),
      );
    })
    this.itemService.getAllItems(localStorage.getItem('id') || "[]").subscribe((data: any) => {
      this.dbItems = data;
    })
  }

  openTaskDialog() {
    const dialogRef = this.dialog.open(BudgetDetailsComponent);
    if (this.modalItemsArray.length > 0) {
      dialogRef.componentInstance.data = this.modalItemsArray;
    }
    dialogRef.componentInstance.dbItems = this.dbItems;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let sumTotalPrice = 0;

        for (let i = 0; i < result.data.length; i++) {
          sumTotalPrice = sumTotalPrice + result.data[i].TotalConcept;
        }

        this.budgetForm.controls['Price'].setValue(Number(sumTotalPrice.toFixed(2)));
        this.modalItemsArray = result.data;

        this.budgetForm.controls['DescriptionItems'].setValue(JSON.stringify(result.data));
      }
    });
  }

  actionBudget() {
    this.loading = true;

    let date = this.budgetForm.controls['Date'].value;
    let formatDate = moment(date).utc().format("DD/MM/YYYY");
    let day = parseInt(formatDate.slice(0, 2)) + 1;
    formatDate = day.toString() + formatDate.slice(2, formatDate.length);

    this.budgetForm.controls['Date'].setValue(formatDate);

    if (this.id == 0) {
      this.budgetForm.removeControl('Id');

      this.budgetForm.controls['ClientId'].setValue(this.clientSelected.Id);
      this.budgetForm.controls['ClientName'].setValue(this.clientSelected.Name);
      this.budgetService.addBudget(this.budgetForm.value).subscribe({
        next: () => {
          this.budgetForm.addControl('Id', new FormControl());
        },
        complete: () => {
          window.location.reload();
        }
      })
    } else {
      if (this.clientSelected == undefined) {
        this.clientSelected = this.clients.find((item: any) => item.Name === this.budgetForm.controls['ClientId'].value)!;
      }
      this.budgetForm.controls['ClientId'].setValue(this.clientSelected.Id);
      this.budgetForm.controls['ClientName'].setValue(this.clientSelected.Name);

      this.budgetService.editBudget(this.id, this.budgetForm.value).subscribe({
        complete: () => {
          setTimeout(() => {
            window.location.reload();
          }, 1000)
        }
      })
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  generateBill() {
    this.loading = true;

    this.billService.cloneRegister(this.id).subscribe({
      complete: () => {
        this.loading = false;
        this.onClose();
        this.router.navigate(['/bills']);
      }
    })
  }

  private _filter(value: any): any[] {
    let filterValue = '';
    if (typeof value === 'number') {
      this.clientSelected = this.clients.find((item: any) => item.Id === value)!;
      filterValue = this.clientSelected.Name.toLowerCase();
    } else {
      filterValue = typeof value === 'string' ? value.toLowerCase() : value.Client.toLowerCase();
      this.clientSelected = this.clients.find((item: any) => item.Name === value)!;
    }

    return this.clients.filter((option: any) => option.Name.toLowerCase().includes(filterValue));
  }
}
