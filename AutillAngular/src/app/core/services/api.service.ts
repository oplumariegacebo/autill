import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private readonly api = 'https://autill-nestjs.vercel.app/Auth/';

  auth(user: any, action: string){
    let auth_action = 'register';
    if(action === 'login'){
      auth_action = 'login';
    }
    return this.http.post(this.api+auth_action, user);
  }

  refreshToken(token: string) {
    // Envía el token actual y recibe el nuevo
    return this.http.post<any>(this.api + 'refresh', { token });
  }
}
