import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SpinnerLoadingComponent } from '../spinner-loading/spinner-loading.component';
import { BudgetService } from '../../../core/services/budget.service';
import { CommonService, Messages } from '../../../core/services/common-service.service';

@Component({
  selector: 'app-send-email',
  standalone: true,
  imports: [SpinnerLoadingComponent],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css'
})
export class SendEmailComponent {
  message: string = '';
  loading: boolean = false;
  client: any;
  user: any;
  budget: any;
  bill:any;
  budgetService = inject(BudgetService);
  commonService = inject(CommonService);

  constructor(public dialogRef: MatDialogRef<SendEmailComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
  confirm(){
    this.loading = true;
    
    let type = '';
    let fileData = null;

    if(this.budget != null){
      type = 'budget';
      fileData = this.budget;
    }

    if(this.bill != null){
      type = 'bill';
      fileData = this.bill;
    }

    setTimeout(() => {
      this.commonService.generatePDF('email',type, fileData.Id);
    }, 2000)

    //this.dialogRef.close('confirm');
  }
}
