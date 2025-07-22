import { Component } from '@angular/core';
import { ApiService } from './core/services/api.service';
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
  screenWidth: number = window.innerWidth;
  private refreshInterval: any;

  constructor(private router: Router, private apiService: ApiService) {
    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth;
    });
  }

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd){
        if(event.url === '/'){
          this.isLogin = true;
        } else {
          this.isLogin = false;
          // Forzar scroll al top al navegar a cualquier ruta distinta de login
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      }
    });
    // Refrescar el token cada 10 minutos si existe
    this.refreshInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        this.apiService.refreshToken(token).subscribe({
          next: (resp) => {
            if(resp && resp.access_token){
              localStorage.setItem('token', resp.access_token);
            }
          },
          error: () => {
            // Si falla, puedes cerrar sesión o mostrar aviso
          }
        });
      }
    }, 10 * 60 * 1000); // 10 minutos
  }

  onMenuStateChange(open: boolean) {
    this.isMenuOpen = open;
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}