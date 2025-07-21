import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { InfoModalComponent } from '../../../shared/components/info-modal/info-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  isMenuOpen: boolean = false;

  constructor(private dialog: MatDialog) { 
  }

  onMenuStateChange(open: boolean) {
    this.isMenuOpen = open;
  }
}
