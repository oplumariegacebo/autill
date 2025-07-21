import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from "./core/components/footer/footer.component";
import { HeaderComponent } from './core/components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isLogin: boolean = false;
  dataComplete = false;
  isMenuOpen: boolean = false;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd){
        if(event.url === '/'){ this.isLogin = true; }
        else { this.isLogin = false; }
      }
    })
  }

  onMenuStateChange(open: boolean) {
    this.isMenuOpen = open;
  }
}
