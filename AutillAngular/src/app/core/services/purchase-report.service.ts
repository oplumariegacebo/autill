import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PurchaseReport } from '../models/PurchaseReport';

@Injectable({
  providedIn: 'root'
})
export class PurchaseReportService {

  constructor(private http: HttpClient) { }

  private readonly api = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    });
  }

  getPurchaseReports(id: string, filters: any, t: number, s: number): Observable<any> {
    const body = { userId: id, filters: filters, take: t, skip: s };
    const headers = this.getHeaders();

    return this.http.post(this.api + '/PurchaseReports/getList', body, { headers });
  }
  editPurchaseReport(id: number, purchaseReport: PurchaseReport) {
    const headers = this.getHeaders();

    return this.http.put(this.api + '/PurchaseReports/' + id, purchaseReport, { headers })
  }
  addPurchaseReport(purchaseReport: PurchaseReport) {
    const headers = this.getHeaders();

    return this.http.post<PurchaseReport>(this.api + '/PurchaseReports', purchaseReport, { headers })
  }
  deletePurchaseReport(id: number) {
    const headers = this.getHeaders();

    return this.http.delete(this.api + '/PurchaseReports/' + id, { headers });
  }
  getPurchaseReportById(id: number) {
    const headers = this.getHeaders();

    return this.http.get(this.api + '/PurchaseReports/' + id, { headers });
  }
  confirmOrder(idReport: number, report: { Id: number, toOrder: number }[]){
    const headers = this.getHeaders();

    return this.http.post<typeof report>(this.api + '/PurchaseReports/orderReceived/' + idReport, report, { headers })
  }
}
