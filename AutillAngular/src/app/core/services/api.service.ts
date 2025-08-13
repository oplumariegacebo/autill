import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private readonly api = `${environment.apiUrl}/auth/`;

  auth(user: any, action: string){
    let auth_action = 'register';
    if(action === 'login'){
      auth_action = 'login';
    } else {
      user.Logo = '<img src="https://www.kindpng.com/picc/m/19-196374_logo-banda-diseo-devorado-plstico-curso-azul-logo.png">';
    }
    return this.http.post(this.api+auth_action, user);
  }

  refreshToken(token: string) {
    return this.http.post<any>(this.api + 'refresh', { token });
  }
}
