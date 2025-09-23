import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PurchaseReportService } from '../../../core/services/purchase-report.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-generate-purchase-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-purchase-report.component.html',
  styleUrl: './generate-purchase-report.component.css'
})
export class GeneratePurchaseReportComponent implements OnInit {
  @Input() items!: any[];
  @Input() report!: any;
  @Input() ids!: any;
  @Input() isView!: boolean;
  @Output() close = new EventEmitter<void>();
  @Output() purchaseOrderGenerated = new EventEmitter<any[]>();
  purchaseReportService = inject(PurchaseReportService);

  constructor(public dialogRef: MatDialogRef<GeneratePurchaseReportComponent>) {
  }

  ngOnInit() {
    if (this.report) {
      this.items = JSON.parse(this.report.DescriptionItems);
    } else {
      this.items.forEach(item => {
        item.toOrder = item.toOrder || 0;
      });
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  generatePurchaseOrder(action: string) {
    if (action === 'generate-report') {
      const orderItems = this.items
        .filter(item => item.toOrder > 0)
        .map(item => ({
          Id: item.Id,
          Name: item.Name,
          Stock: item.Stock,
          toOrder: item.toOrder,
          OrderPriceImp: item.OrderPriceImp,
          OrderPrice: item.OrderPrice
        }));

      if (orderItems.length > 0) {
        this.purchaseOrderGenerated.emit(orderItems);

        let purchaseReport = { "IdBusiness": this.ids['IdBusiness'], "IdSupplier": this.ids['IdSupplier'], "DescriptionItems": JSON.stringify(orderItems), "Execute": false, "TotalPrice": 0, "TotalPriceImp": 0 }

        const totalPriceImp = orderItems.reduce((acc, item) => {
          return acc + (item.toOrder * item.OrderPriceImp);
        }, 0);

        const totalPrice = orderItems.reduce((acc, item) => {
          return acc + (item.toOrder * item.OrderPrice);
        }, 0);
        
        purchaseReport.TotalPrice = totalPrice;
        purchaseReport.TotalPriceImp = totalPriceImp;

        this.purchaseReportService.addPurchaseReport(purchaseReport).subscribe((res: any) => {
          this.onClose();
          window.location.reload();
        });
      }
    } else if (action === 'edit') {
      const updatedReport = { ...this.report, DescriptionItems: JSON.stringify(this.items) };
      this.purchaseReportService.editPurchaseReport(this.report.Id, updatedReport).subscribe((res: any) => {
        this.onClose();
        window.location.reload();
      })
    } else {
      this.purchaseReportService.confirmOrder(this.report.Id, this.items).subscribe((res: any) => {
        this.onClose();
        window.location.reload();
      })
    }

  }
}
