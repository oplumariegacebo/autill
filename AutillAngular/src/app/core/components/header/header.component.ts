import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkWithHref, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public href: string = "";
  isMenuOpen: boolean = false;
  screenWidth: number = window.innerWidth;
  @Output() menuStateChange = new EventEmitter<boolean>()

  constructor(private router: Router) {
    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth;
    });
  }

  logout() {
    localStorage.clear();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuStateChange.emit(this.isMenuOpen);
  }

  ngOnInit() {

  }

  activeNav(element: string) {
    //document.getElementById(element)!.classList.add('selected');
  }
}
