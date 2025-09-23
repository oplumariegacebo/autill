import { Component, inject } from '@angular/core';
import { PurchaseReportService } from '../../services/purchase-report.service';
import { CommonModule } from '@angular/common';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { SpinnerLoadingComponent } from '../../../shared/components/spinner-loading/spinner-loading.component';
import { MatDialog } from '@angular/material/dialog';
import { GeneratePurchaseReportComponent } from '../../../shared/components/generate-purchase-report/generate-purchase-report.component';
import { DeleteItemModalComponent } from '../../../shared/components/delete-item-modal/delete-item-modal.component';
import { CommonService, Messages } from '../../services/common-service.service';
import { PurchaseReport } from '../../models/PurchaseReport';
import { SearchFiltersComponent } from '../../../shared/components/search-filters/search-filters.component';
import { ErrorsComponent } from '../../../shared/components/errors/errors.component';


@Component({
  selector: 'app-purchase-reports',
  standalone: true,
  imports: [CommonModule, SpinnerLoadingComponent, SearchFiltersComponent, ErrorsComponent],
  templateUrl: './purchase-reports.component.html',
  styleUrl: './purchase-reports.component.css'
})
export class PurchaseReportsComponent {

  purchaseReportService = inject(PurchaseReportService);
  reports!: any;
  suppliersService = inject(SuppliersService);
  commonService = inject(CommonService);
  loading: boolean = false;
  showFilters = false;
  filtersActivated: any = null;
  errorMessage: string = '';
  allReports: any = [];
  dataReports: any = [];
  dataScreen: string = 'purchaseReports';
  userId = localStorage.getItem('id') || "[]";

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    this.loadReportsWithSupplierNames();
  }

  loadReportsWithSupplierNames(): void {
    this.loading = true;

    forkJoin({
      reportsResponse: this.purchaseReportService.getPurchaseReports(this.userId, 0, 10, 0),
      suppliers: this.suppliersService.getAllSuppliers(this.userId)
    }).pipe(
      map(({ reportsResponse, suppliers }) => {
        const supplierMap = new Map<string, string>();
        suppliers.data.forEach((s: any) => supplierMap.set(s.Id, s.Name));

        const enrichedData = reportsResponse.data.map((report: any) => ({
          ...report,
          supplierName: supplierMap.get(report.IdSupplier) || 'Proveedor Desconocido'
        }));

        return { ...reportsResponse, data: enrichedData };
      })
    ).subscribe({
      next: (enrichedReports) => {
        this.reports = enrichedReports;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar los reportes y proveedores', err);
        this.loading = false;
      }
    });
  }

  openTaskDialog(action: string, report: PurchaseReport) {
    if (action === 'edit') {
      const dialogRef = this.dialog.open(GeneratePurchaseReportComponent);
      dialogRef.componentInstance.report = report;
      dialogRef.componentInstance.isView = true;
    }else if(action === 'generatePDF'){
      this.commonService.generatePurchaseReportPDF(report.Id);
    } else {
      const dialogRef = this.dialog.open(GeneratePurchaseReportComponent);
      dialogRef.componentInstance.report = report;
      dialogRef.componentInstance.isView = false;
    }
  }

  updateSearching(formControlValue: any) {
    if (formControlValue === "") {
      this.filtersActivated = null;
      this.purchaseReportService.getPurchaseReports(localStorage.getItem('id') || "[]", null, 10, 0).subscribe((reports: any) => {
        this.allReports = reports;
        this.dataReports = reports;
        this.reports = reports;
      })
    } else {
      this.filtersActivated = formControlValue;
      this.purchaseReportService.getPurchaseReports(localStorage.getItem('id') || "[]", formControlValue, 10, 0).subscribe((filterBudgets: any) => {
        this.reports = filterBudgets;
        this.allReports = this.reports;
      });
    }
  }

  deleteItem(id: number) {
    const dialogRef = this.dialog.open(DeleteItemModalComponent);
    dialogRef.componentInstance.type = 'purchase-report';
    dialogRef.componentInstance.title = Messages.DELETE_ITEM_TITLE;
    dialogRef.componentInstance.message = Messages.DELETE_ITEM_MSG;
    dialogRef.componentInstance.id = id;

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result === 'confirm') {
        this.loadReportsWithSupplierNames();
      }
    });
  }

}
