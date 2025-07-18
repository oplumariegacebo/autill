import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SpinnerLoadingComponent } from '../spinner-loading/spinner-loading.component';
import { ClientService } from '../../../core/services/client.service';
import { Messages } from '../../../core/services/common-service.service';

@Component({
  selector: 'app-clients-modal',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerLoadingComponent],
  templateUrl: './clients-modal.component.html',
  styleUrl: './clients-modal.component.css'
})
export class ClientsModalComponent {
  clientForm!: FormGroup
  id!: number;
  client: Object = {};
  loading:boolean = false;
  clientService = inject(ClientService);
  formatNif = false;
  formatZip = false;
  formatName = false;
  formatPhoneNumber = false;
  formatEmail = false;
  messages = Messages;

  initializeForm(){
    this.clientForm = new FormGroup({
      Id: new FormControl(),
      Name: new FormControl('',[Validators.required,Validators.pattern('^[a-zA-Z ]*$')]),
      Address: new FormControl(),
      Region: new FormControl(),
      City: new FormControl(),
      PostalCode: new FormControl('',[Validators.pattern(/^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/), Validators.required, Validators.maxLength(5)]),
      Email: new FormControl('',[Validators.required, Validators.email]),
      Country: new FormControl(),
      IdBusiness: new FormControl(localStorage.getItem('id') || "[]"),
      Nif: new FormControl('',[Validators.pattern(/(^[ABCDFGHJKLMNPQRSUVWabcdfghlmnpqrsuvw]([0-9]{7})([0-9A-Ja]$))|(^[0-9]{8}[A-Z]$)/), Validators.required, Validators.maxLength(9)]),
      PhoneNumber: new FormControl('',[Validators.pattern(/^[+]?(?:\(\d+(?:\.\d+)?\)|\d+(?:\.\d+)?)(?:[ -]?(?:\(\d+(?:\.\d+)?\)|\d+(?:\.\d+)?))*(?:[ ]?(?:x|ext)\.?[ ]?\d{1,5})?$/), Validators.required, Validators.maxLength(9)])
    })
  }

  constructor(public dialogRef: MatDialogRef<ClientsModalComponent>, private formBuilder: FormBuilder){
    this.initializeForm();
  }

  ngOnInit() {
    if(this.id > 0){
      this.clientService.getClientById(this.id).subscribe((client:any) =>{
        this.clientForm.setValue(client);
      })
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  actionClient(){
    if(this.clientForm.valid){
      this.loading = true;
      if(this.id == 0){
        this.clientForm.removeControl('Id');
        this.clientService.addClient(this.clientForm.value).subscribe({
          next: () => {
            this.clientForm.addControl('Id', new FormControl());
          },
          complete: () => {
            window.location.reload();
          }
        })
      }else{
        this.clientService.editClient(this.id, this.clientForm.value).subscribe({
          complete: () => {
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          }
        })
      }
    }else{
      if(!this.clientForm.controls['PhoneNumber'].valid){
        this.formatPhoneNumber = true;
      }
      if(!this.clientForm.controls['Name'].valid){
        this.formatName = true;
      }
      if(!this.clientForm.controls['Nif'].valid){
        this.formatNif = true;
      }
      if(!this.clientForm.controls['PostalCode'].valid){
        this.formatZip = true;
      }
      if(!this.clientForm.controls['Email'].valid){
        this.formatEmail = true;
      }
    }
  }

}
