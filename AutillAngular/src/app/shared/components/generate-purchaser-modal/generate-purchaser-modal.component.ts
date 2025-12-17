import { Component, inject } from '@angular/core';
import { ItemService } from '../../../core/services/item.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, map, Observable, of, switchMap, finalize } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { Item } from '../../../core/models/Item';
import { PurchaseReportService } from '../../../core/services/purchase-report.service';

interface GroupedItemValue {
  supplierInfo: any;
  items: Item[];
}

@Component({
  selector: 'app-generate-purchaser-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule
  ],
  templateUrl: './generate-purchaser-modal.component.html',
  styleUrl: './generate-purchaser-modal.component.css'
})
export class GeneratePurchaserModalComponent {

  itemsService = inject(ItemService);
  supplierService = inject(SuppliersService);
  purchaseReportService = inject(PurchaseReportService);
  groupedItems: {
    [key: string]: GroupedItemValue
  } = {};
  selectedItems: { [itemId: string]: boolean } = {};
  isLoading = true;

  constructor(public dialogRef: MatDialogRef<GeneratePurchaserModalComponent>){
    
  }

  ngOnInit() {
    this.itemsService.getItemsLowStock(localStorage.getItem('id') || "[]")
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('Datos cargados:', this.groupedItems);
        }),
        switchMap((response: any) => {
          const items: Item[] = response.data || [];
          return this.processItemsAndFetchSuppliers(items);
        })
      )
      .subscribe({
        next: (groupedData) => {
          this.groupedItems = groupedData;
        },
        error: (err) => console.error('Error en el proceso:', err)
      });
  }

  private processItemsAndFetchSuppliers(items: Item[]): Observable<{ [key: string]: GroupedItemValue }> {
    const itemsBySupplier = items.reduce((acc, item) => {
      const supplierId = item.IdSupplier;
      item.toOrder = 1; // Inicializamos la cantidad a pedir
      (acc[supplierId] = acc[supplierId] || []).push(item);
      return acc;
    }, {} as { [key: string]: Item[] });

    const supplierIds = Object.keys(itemsBySupplier);

    if (supplierIds.length === 0) {
      return of({});
    }

    const supplierRequests = supplierIds.reduce((acc, id) => {
      acc[id] = this.supplierService.getSupplierById(parseInt(id));
      return acc;
    }, {} as { [key: string]: any });

    return forkJoin(supplierRequests).pipe(
      map((supplierResults: any) => {
        return supplierIds.reduce((acc, id) => {
        acc[id] = { supplierInfo: supplierResults[id].data, items: itemsBySupplier[id] };
        return acc;
      }, {} as typeof this.groupedItems);
      })
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }

  generatePurchaseOrder() {
    const selectedGroupedItems: { [key: string]: GroupedItemValue } = {};

    for (const supplierId in this.groupedItems) {
      if (Object.prototype.hasOwnProperty.call(this.groupedItems, supplierId)) {
        const originalGroup = this.groupedItems[supplierId];

        const selectedSupplierItems = originalGroup.items.filter(
          item => this.selectedItems[item.Id] && item.toOrder > 0
        );

        if (selectedSupplierItems.length > 0) {
          selectedGroupedItems[supplierId] = {
            supplierInfo: originalGroup.supplierInfo,
            items: selectedSupplierItems,
          };
        }
      }
    }

    for (const supplierId in selectedGroupedItems) {
      if (Object.prototype.hasOwnProperty.call(selectedGroupedItems, supplierId)) {
        const group = selectedGroupedItems[supplierId];

        const reportItems = group.items.map(item => ({
          Id: item.Id,
          Name: item.Name,
          Stock: item.Stock,
          toOrder: item.toOrder,
          OrderPrice: item.OrderPrice,
          OrderPriceImp: item.OrderPriceImp
        }));

        const totalPriceNum = reportItems.reduce((acc, item) => acc + (item.toOrder * parseFloat(item.OrderPrice)), 0);
        const totalPriceImpNum = reportItems.reduce((acc, item) => acc + (item.toOrder * parseFloat(item.OrderPriceImp)), 0);

        const purchaseReport = {
          IdBusiness: parseInt(localStorage.getItem('id') || '0', 10),
          IdSupplier: parseInt(supplierId, 10),
          DescriptionItems: JSON.stringify(reportItems),
          Execute: false,
          TotalPrice: totalPriceNum,
          TotalPriceImp: totalPriceImpNum
        };

        this.purchaseReportService.addPurchaseReport(purchaseReport).subscribe({
          next: (res) => console.log(`Informe para proveedor ${supplierId} generado con éxito:`, res),
          error: (err) => console.error(`Error generando informe para proveedor ${supplierId}:`, err)
        });
      }
    }

    this.dialogRef.close(true); 
  }
}
