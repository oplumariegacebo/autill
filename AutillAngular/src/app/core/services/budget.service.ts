import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Budget } from '../models/Budget';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor(private http: HttpClient) { }

  private readonly api = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    });
  }

  getBudgets(id:string, filters: any, t: number, s:number): Observable<any>{
    const body = {userId: id, filters: filters, take: t, skip: s};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Budgets/getList',body, { headers });
  }
  nextBudgetName(id: any): Observable<any>{
    const body = {userId: id};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Budgets/nextName', body, {headers});
  }
  editBudget(id:number, budget:Budget){
    const headers = this.getHeaders();

    return this.http.put(this.api+'/Budgets/'+id, budget, {headers})
  }
  addBudget(budget:Budget){
    const headers = this.getHeaders();

    return this.http.post<Budget>(this.api+'/Budgets', budget, {headers})
  }
  deleteBudget(id: number){
    const headers = this.getHeaders();

    return this.http.delete(this.api+'/Budgets/'+id, {headers});
  }
  getBudgetById(id: number){
    const headers = this.getHeaders();

    return this.http.get(this.api+'/Budgets/'+id, {headers});
  }
  sendEmail(from:any, to:any, mail:any, file:any){
    const body = {from: from, to: to, mail: mail, file: file};
    const headers = this.getHeaders();

    return this.http.post(this.api+'/Budgets/mailInfo', body, {headers});
  }
}
