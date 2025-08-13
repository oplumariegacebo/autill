import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client } from '../models/Client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient) { }

  private readonly api = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    });
  }

  getClients(id:string, filters: any, t: number, s:number){
    const body = {userId: id, filters: filters, take: t, skip: s};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Clients/getList',body,{headers});
  }
  getAllClients(id:string): Observable<any>{
    const body = {userId: id};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Clients/getList',body,{headers});
  }
  getClientById(id:number){
    const headers = this.getHeaders();
    return this.http.get(this.api+'/Clients/'+id,{headers});
  }
  deleteClient(id: number){
    const headers = this.getHeaders();
    return this.http.delete(this.api + '/Clients/' + id, { headers, observe: 'response' });
  }
  addClient(client:Client){
    const headers = this.getHeaders();
    return this.http.post<Client>(this.api+'/Clients', client,{headers})
  }
  editClient(id:number, client:any){
    const headers = this.getHeaders();
    return this.http.put(this.api+'/Clients/'+id, client,{headers})
  }
}
