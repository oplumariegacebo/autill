import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface UserEdit {
  email: string;
  address: string;
  phoneNumber: number;
  cif: string;
}

interface Client{
  id: number,
  name: string,
  address: string,
  region: string,
  city: string,
  postalCode: number,
  email: string,
  country: string,
  cif: string,
  phoneNumber: number
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  private readonly api = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    });
  }

  getUserByEmail(email: string) {
    const headers = this.getHeaders();

    return this.http.get(this.api+'/Users/getByEmail/'+email,{headers});
  }
  getUserById(id: any) {
    const headers = this.getHeaders();

    return this.http.get(this.api+'/Users/'+id,{headers});
  }
  editUser(user: any){
    const headers = this.getHeaders();
    const requiredFields = [
      'FullName', 'Email', 'Address', 'PhoneNumber', 'Nif', 'Id', 'PostalCode', 'Region', 'Country', 'Password'
    ];
    let dataComplete = true;
    for (const field of requiredFields) {
      if (!user[field] && user[field] !== 0) {
        dataComplete = false;
        break;
      }
    }
    user.DataComplete = dataComplete ? true : null;
    return this.http.put<UserEdit>(this.api+'/Users', user,{headers});
  }
}
