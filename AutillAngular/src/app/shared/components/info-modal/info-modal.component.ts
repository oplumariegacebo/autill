import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Messages } from '../../../core/services/common-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [],
  templateUrl: './info-modal.component.html',
  styleUrl: './info-modal.component.css'
})
export class InfoModalComponent {
  message: string = '';

  constructor(public dialogRef: MatDialogRef<InfoModalComponent>, private router: Router) {
  }

  onClose(): void {
    this.dialogRef.close();
  }
  confirm(){
    this.dialogRef.close();
    window.location.reload();
    //this.dialogRef.close('confirm');
  }
}
