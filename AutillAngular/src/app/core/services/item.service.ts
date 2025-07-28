import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from '../models/Item';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(private http: HttpClient) { }

  private readonly api = 'https://autill-nestjs.vercel.app';

  private getHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    });
  }

  deleteProduct(id: number){
    const headers = this.getHeaders();
    return this.http.delete(this.api+'/Items/'+id, {headers, observe: 'response'});
  }
  getItems(id:string, filters: any, t: number, s:number): Observable<any>{
    const body = {userId: id, filters: filters, take: t, skip: s};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Items/getList',body, {headers});
  }
  getAllItems(id:string): Observable<any>{
    const body = {userId: id};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Items/getList',body, {headers});
  }
  editItem(id:number, item:Item){
    const headers = this.getHeaders();
    return this.http.put(this.api+'/Items/'+id, item,{headers});
  }
  addItem(item:Item){
    const headers = this.getHeaders();
    return this.http.post<Item>(this.api+'/Items', item,{headers});
  }
}
