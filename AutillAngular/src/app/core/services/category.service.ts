import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../models/Category';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  private readonly api = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    });
  }

  deleteCategory(id: number){
    const headers = this.getHeaders();
    return this.http.delete(this.api+'/Categories/'+id, {headers});
  }
  getCategories(id:string, filters: any, t: number, s:number): Observable<any>{
    const body = {userId: id, filters: filters, take: t, skip: s};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Categories/getList',body, {headers});
  }
  getAllCategories(id:string): Observable<any>{
    const body = {userId: id};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Categories/getList',body, {headers});
  }
  editCategory(id:number, item:Category){
    const headers = this.getHeaders();
    return this.http.put(this.api+'/Categories/'+id, item,{headers});
  }
  addCategory(item:Category){
    const headers = this.getHeaders();
    return this.http.post<Category>(this.api+'/Categories', item,{headers});
  }
}
