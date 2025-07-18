import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterLinkWithHref, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public href: string = "";

  constructor(private router : Router) {}

  logout(){
    localStorage.clear();
  }

  ngOnInit() {
    //this.href = this.router;
    console.log(this.router.url);
  }

  activeNav(element: string){
    //document.getElementById(element)!.classList.add('selected');
  }
}
