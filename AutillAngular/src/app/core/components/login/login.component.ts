import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { SpinnerLoadingComponent } from '../../../shared/components/spinner-loading/spinner-loading.component';
import { UserService } from '../../services/user.service';
import { CommonService, Messages } from '../../services/common-service.service';
import { InfoModalComponent } from '../../../shared/components/info-modal/info-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerLoadingComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          height: '200px',
          opacity: 1,
          backgroundColor: 'yellow',
        }),
      ),
      state(
        'closed',
        style({
          height: '100px',
          opacity: 0.8,
          backgroundColor: 'blue',
        }),
      ),
      transition('open => closed', [animate('1s')]),
      transition('closed => open', [animate('0.5s')]),
    ])
  ]
})
export class LoginComponent {
  registerForm!: FormGroup
  loginForm!: FormGroup
  register_option = false;
  err: any | null;
  loading: boolean = false;
  apiService = inject(ApiService);
  userService = inject(UserService);
  commonService = inject(CommonService);
  formatNif = false;
  formatZip = false;
  formatName = false;
  formatPhoneNumber = false;
  formatEmail = false;
  formatPassword = false;
  messages = Messages;
  show: boolean = false;
  @Output() newItemEvent = new EventEmitter<boolean>();

  initializeForm() {
    this.loginForm = new FormGroup({
      Email: new FormControl('', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]),
      Password: new FormControl('', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]),
    })

    this.registerForm = new FormGroup({
      FullName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      Email: new FormControl('', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]),
      Address: new FormControl(),
      PhoneNumber: new FormControl('', [Validators.pattern(/^[+]?(?:\(\d+(?:\.\d+)?\)|\d+(?:\.\d+)?)(?:[ -]?(?:\(\d+(?:\.\d+)?\)|\d+(?:\.\d+)?))*(?:[ ]?(?:x|ext)\.?[ ]?\d{1,5})?$/), Validators.required, Validators.maxLength(9)]),
      Logo: new FormControl(),
      Nif: new FormControl('', [Validators.pattern(/^(\d{8})([A-Z])$/), Validators.required, Validators.maxLength(9)]),
      Id: new FormControl(),
      PostalCode: new FormControl(),
      Region: new FormControl(),
      Country: new FormControl(),
      Password: new FormControl('', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]),
      DataComplete: new FormControl()
    })
  }

  constructor(private dialog: MatDialog, private formBuilder: FormBuilder, private router: Router) {
    this.initializeForm();
  }

  seePassword() {
    this.show = !this.show;
  }

  login() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.apiService.auth(this.loginForm.value, 'login').subscribe((token: any) => {
        localStorage.setItem('token', token.access_token);
        setTimeout(() => {
          localStorage.setItem('email', this.loginForm.controls['Email'].value);
          this.userService.getUserByEmail(localStorage.getItem('email') || "[]").subscribe((data: any) => {
            localStorage.setItem('id', data.Id);
            this.router.navigate(['/home']);
          })
        }, 1000)
      });
    } else {
      if (!this.loginForm.controls['Email'].valid) {
        this.formatEmail = true;
      }
      if (!this.loginForm.controls['Password'].valid) {
        this.formatPassword = true;
      }
    }
  }

  register() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.apiService.auth(this.registerForm.value, 'register').subscribe({
        error: (err) => {
          let errObj = err.error.errors;
          this.err = Object.values(errObj);
        },
        complete: () => {
          this.register_option = false;
          this.loading = false;
        }
      });
    } else {
      if (!this.registerForm.controls['PhoneNumber'].valid) {
        this.formatPhoneNumber = true;
      }
      if (!this.registerForm.controls['FullName'].valid) {
        this.formatName = true;
      }
      if (!this.registerForm.controls['Nif'].valid) {
        this.formatNif = true;
      }
      if (!this.registerForm.controls['PostalCode'].valid) {
        this.formatZip = true;
      }
      if (!this.registerForm.controls['Email'].valid) {
        this.formatEmail = true;
      }
      if (!this.registerForm.controls['Password'].valid) {
        this.formatPassword = true;
      }
    }
  }

  changeForm() {
    this.register_option = !this.register_option;
  }
}
