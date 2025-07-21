import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  standalone: true,
imports: [CommonModule],
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
