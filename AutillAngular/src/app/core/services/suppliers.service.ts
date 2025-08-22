import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Supplier } from '../models/Supplier';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  constructor(private http: HttpClient) { }

  private readonly api = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    });
  }

  getSuppliers(id:string, filters: any, t: number, s:number){
    const body = {userId: id, filters: filters, take: t, skip: s};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Suppliers/getList',body,{headers});
  }
  getAllSuppliers(id:string): Observable<any>{
    const body = {userId: id};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Suppliers/getList',body,{headers});
  }
  getSupplierById(id:number){
    const headers = this.getHeaders();
    return this.http.get(this.api+'/Suppliers/'+id,{headers});
  }
  deleteSupplier(id: number){
    const headers = this.getHeaders();
    return this.http.delete(this.api + '/Suppliers/' + id, { headers, observe: 'response' });
  }
  add(supplier:Supplier){
    const headers = this.getHeaders();
    return this.http.post<Supplier>(this.api+'/Suppliers', supplier,{headers})
  }
  edit(id:number, supplier:any){
    const headers = this.getHeaders();
    return this.http.put(this.api+'/Suppliers/'+id, supplier,{headers})
  }
}
