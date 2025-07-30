import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private readonly api = 'https://autill-nestjs.vercel.app/auth/';

  auth(user: any, action: string){
    let auth_action = 'register';
    if(action === 'login'){
      auth_action = 'login';
    } else {
      user.Logo = 'https://www.kindpng.com/picc/m/485-4852562_searching-logo-hd-png-download.png';
    }
    return this.http.post(this.api+auth_action, user);
  }

  refreshToken(token: string) {
    return this.http.post<any>(this.api + 'refresh', { token });
  }
}
