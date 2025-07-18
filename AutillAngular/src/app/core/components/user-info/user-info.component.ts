import { Component, inject, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/User';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerLoadingComponent } from '../../../shared/components/spinner-loading/spinner-loading.component';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { CommonService, Messages } from '../../services/common-service.service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerLoadingComponent],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent {
  userInfo!: FormGroup
  logoPath!: string
  loading: boolean = false;
  emailLogin: string = '';
  userService = inject(UserService);
  formatNif = false;
  formatZip = false;
  formatName = false;
  formatPhoneNumber = false;
  formatEmail = false;
  messages = Messages;
  commonService = inject(CommonService);

  initializeForm(){
    this.userInfo = new FormGroup({
      FullName: new FormControl('',[Validators.required,Validators.pattern('^[a-zA-Z ]*$')]),
      Email: new FormControl('',[Validators.required, Validators.email]),
      Address: new FormControl(),
      PhoneNumber: new FormControl('',[Validators.pattern(/^[+]?(?:\(\d+(?:\.\d+)?\)|\d+(?:\.\d+)?)(?:[ -]?(?:\(\d+(?:\.\d+)?\)|\d+(?:\.\d+)?))*(?:[ ]?(?:x|ext)\.?[ ]?\d{1,5})?$/), Validators.required, Validators.maxLength(9)]),
      Logo: new FormControl(),
      Nif: new FormControl('',[Validators.pattern( /^(\d{8})([A-Z])$/), Validators.required, Validators.maxLength(9)]),
      Id: new FormControl(),
      PostalCode: new FormControl(),
      Region: new FormControl(),
      Country: new FormControl(),
      Password: new FormControl(),
      DataComplete: new FormControl()
    })
  }

  constructor (private formBuilder: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit() {
    this.userService.getUserById(localStorage.getItem('id') || "[]").subscribe((data: any) => {
      this.userInfo.setValue(data);
      this.logoPath = data.logo;
    })
  }

  updateUser(){
    if(this.userInfo.valid){
      this.userService.editUser(this.userInfo.value).subscribe({
        next: () => {
          this.loading = true;
        },
        complete: () => {
          setTimeout(() => {
            window.location.reload();
          }, 2000)
        }
      })
    }else{
      if(!this.userInfo.controls['PhoneNumber'].valid){
        this.formatPhoneNumber = true;
      }
      if(!this.userInfo.controls['FullName'].valid){
        this.formatName = true;
      }
      if(!this.userInfo.controls['Nif'].valid){
        this.formatNif = true;
      }
      if(!this.userInfo.controls['PostalCode'].valid){
        this.formatZip = true;
      }
      if(!this.userInfo.controls['Email'].valid){
        this.formatEmail = true;
      }
    }
  }

}
