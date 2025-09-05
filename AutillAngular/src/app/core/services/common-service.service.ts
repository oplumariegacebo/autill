import { inject, Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { ApiService } from './api.service';
import autoTable from 'jspdf-autotable'
import { BudgetService } from './budget.service';
import { ClientService } from './client.service';
import { UserService } from './user.service';
import { InfoModalComponent } from '../../shared/components/info-modal/info-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { SpinnerLoadingComponent } from '../../shared/components/spinner-loading/spinner-loading.component';
import { PurchaseReportService } from './purchase-report.service';
import { SuppliersService } from './suppliers.service';
import { ItemService } from './item.service';

export let Messages = {
  "EMAIL_MSG": "El email debe de tener un formato válido.",
  "PNUMBER_MSG": "El número de teléfono debe de tener un formato válido.",
  "NIF_MSG": "El NIF debe de tener un formato válido.",
  "PASSWORD_MSG": "La contraseña tiene que tener una mayúscula, número, carácter especial (!,?...) y mínimo 8 carácteres.",
  "NAME_MSG": "El nombre debe de tener un formato válido.",
  "ZIP_MSG": "El código postal debe de tener un formato válido.",
  "EMAIL_OK": "El email se ha enviado correctamente.",
  "DELETE_BUDGET_TITLE": "¿Desea eliminar el presupuesto?",
  "DELETE_BUDGET_MSG": "Si elimina el presupuesto, también se eliminará la factura asociada al mismo.",
  "DELETE_BILL_TITLE": "¿Desea eliminar la factura?",
  "DELETE_BILL_MSG": "Se borrará permanentemente.",
  "DELETE_ITEM_TITLE": "¿Desea eliminar el producto/servicio?",
  "DELETE_ITEM_MSG": "Si elimina el producto/servicio, no podrás añadirle ni editarle en presupuestos existentes.",
  "DELETE_CLIENT_TITLE": "¿Desea eliminar el cliente?",
  "DELETE_CLIENT_MSG": "Si elimina el cliente, no podrás asignarle un presupuesto ni aparecerá en ninguna página de la aplicación.",
  "SEND_EMAIL": "¿Desea enviar el presupuesto en formato PDF al email: ",
  "DELETE_SUPPLIER_TITLE": "¿Desea eliminar el proveedor?",
  "DELETE_SUPPLIER_MSG": "Si elimina el proveedor, no podrás asignarle un presupuesto ni aparecerá en ninguna página de la aplicación.",
  "DELETE_REPORT_TITLE": "¿Desea eliminar el informde de compra?",
  "DELETE_REPORT_MSG": "Si elimina el informe de compra, no podrás volver a editarle ni confirmarle."
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  apiService = inject(ApiService);
  budgetService = inject(BudgetService);
  clientService = inject(ClientService);
  userService = inject(UserService);
  purchaseReportService = inject(PurchaseReportService);
  itemService = inject(ItemService);
  supplierService = inject(SuppliersService);

  constructor(private dialog: MatDialog) { }

  generatePDF(action: string, type: string, id: number) {
    const spinnerRef = this.dialog.open(SpinnerLoadingComponent, {
      disableClose: true,
      panelClass: 'transparent-modal'
    });

    const file = new jsPDF();
    const title = type === 'bill'
      ? 'Factura'
      : type === 'budget'
        ? 'Presupuesto'
        : type === 'transport'
          ? 'Detalle mercancía'
          : 'Nota simple';

    this.budgetService.getBudgetById(id).subscribe((budget: any) => {
      this.userService.getUserById(budget.IdBusiness).subscribe((user: any) => {
        this.clientService.getClientById(budget.ClientId).subscribe((client: any) => {
          const logoY = 15;
          const logoX = 10;
          const logoWidth = 30;
          const logoHeight = 30;
          file.addImage('/assets/images/autill_logo.png', 'PNG', logoX, logoY, logoWidth, logoHeight);

          file.setFontSize(22);

          if (type === 'transport') {
            file.text(title, file.internal.pageSize.getWidth() - 10, logoY + logoHeight / 2, { align: 'right' });
          } else {
            file.text(title + ' ' + budget.Name, file.internal.pageSize.getWidth() - 10, logoY + logoHeight / 2, { align: 'right' });
          }

          file.setFontSize(14);
          file.setFont('helvetica', 'normal');
          const fecha = budget.Date ? (typeof budget.Date === 'string' ? budget.Date : this.transformDate(budget.Date)) : '';
          file.text(fecha, file.internal.pageSize.getWidth() - 10, logoY + logoHeight / 2 + 8, { align: 'right' });
          file.setFont('helvetica', 'normal');

          const headerBottomY = logoY + logoHeight - 4;
          file.setDrawColor(200);
          file.setLineWidth(0.5);
          file.line(logoX, headerBottomY, file.internal.pageSize.getWidth() - logoX, headerBottomY);

          file.setFontSize(12);
          file.setTextColor(40);
          let leftColX = logoX;
          let rightColX = file.internal.pageSize.getWidth() / 2 + 10;
          let firstRowY = headerBottomY + 10;
          let rowHeight = 8;

          file.setFont('helvetica', 'bold');
          file.text('Empresa:', leftColX, firstRowY);
          file.setFont('helvetica', 'normal');
          file.text(String(user.data.FullName || ''), leftColX + 25, firstRowY);

          file.setFont('helvetica', 'bold');
          file.text('Email:', leftColX, firstRowY + rowHeight);
          file.setFont('helvetica', 'normal');
          file.text(String(user.data.Email || ''), leftColX + 25, firstRowY + rowHeight);

          file.setFont('helvetica', 'bold');
          file.text('NIF:', leftColX, firstRowY + rowHeight * 2);
          file.setFont('helvetica', 'normal');
          file.text(String(user.data.Nif || ''), leftColX + 25, firstRowY + rowHeight * 2);

          file.setFont('helvetica', 'bold');
          file.text('Dirección:', leftColX, firstRowY + rowHeight * 3);
          file.setFont('helvetica', 'normal');
          file.text(String(user.data.Address || ''), leftColX + 25, firstRowY + rowHeight * 3);

          file.text(String((user.data.Region || '') + ', ' + (user.Country || '')), leftColX + 25, firstRowY + rowHeight * 4);

          file.setFont('helvetica', 'bold');
          file.text('Teléfono:', leftColX, firstRowY + rowHeight * 5);
          file.setFont('helvetica', 'normal');
          file.text(String(user.data.PhoneNumber || ''), leftColX + 25, firstRowY + rowHeight * 5);

          const labelWidth = 5;
          const rightBlockX = file.internal.pageSize.getWidth() - 80;
          file.setFont('helvetica', 'bold');
          file.text('Cliente:', rightBlockX, firstRowY, { align: 'right' });
          file.setFont('helvetica', 'normal');
          file.text(String(client.data.Name || ''), rightBlockX + labelWidth, firstRowY, { align: 'left' });
          file.setFont('helvetica', 'bold');
          file.text('Email:', rightBlockX, firstRowY + rowHeight, { align: 'right' });
          file.setFont('helvetica', 'normal');
          file.text(String(client.data.Email || ''), rightBlockX + labelWidth, firstRowY + rowHeight, { align: 'left' });
          file.setFont('helvetica', 'bold');
          file.text('NIF:', rightBlockX, firstRowY + rowHeight * 2, { align: 'right' });
          file.setFont('helvetica', 'normal');
          file.text(String(client.data.Nif || ''), rightBlockX + labelWidth, firstRowY + rowHeight * 2, { align: 'left' });
          file.setFont('helvetica', 'bold');
          file.text('Dirección:', rightBlockX, firstRowY + rowHeight * 3, { align: 'right' });
          file.setFont('helvetica', 'normal');
          file.text(String(client.data.Address || ''), rightBlockX + labelWidth, firstRowY + rowHeight * 3, { align: 'left' });
          file.text(String((client.data.Region || '') + ', ' + (client.data.Country || '')), rightBlockX + labelWidth, firstRowY + rowHeight * 4, { align: 'left' });
          file.setFont('helvetica', 'bold');
          file.text('Teléfono:', rightBlockX, firstRowY + rowHeight * 5, { align: 'right' });
          file.setFont('helvetica', 'normal');
          file.text(String(client.data.PhoneNumber || ''), rightBlockX + labelWidth, firstRowY + rowHeight * 5, { align: 'left' });

          let tableMargin = { left: logoX, right: logoX, top: firstRowY + rowHeight * 6 + 10 };
          let tableWidth = file.internal.pageSize.getWidth() - logoX * 2;
          let bodyFormatItems = [];
          const items = JSON.parse(budget.DescriptionItems);

          if (type === 'transport') {
            for (let i = 0; i < items.length; i++) {
              bodyFormatItems.push([
                items[i].Ref,
                items[i].Name,
                items[i].Units
              ]);
            }
            autoTable(file, {
              startY: tableMargin.top,
              margin: { left: tableMargin.left, right: tableMargin.right },
              tableWidth: tableWidth,
              head: [["Referencia", "Concepto", "Unidades"]],
              body: bodyFormatItems,
              headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
              styles: { fontSize: 12, cellPadding: 3 },
              alternateRowStyles: { fillColor: [245, 245, 245] },
            })
          } else {
            for (let i = 0; i < items.length; i++) {
              bodyFormatItems.push([
                items[i].Ref,
                items[i].Name,
                items[i].Units,
                String(items[i].Price) + ' €',
                String(items[i].TotalConcept) + ' €'
              ]);
            }
            autoTable(file, {
              startY: tableMargin.top,
              margin: { left: tableMargin.left, right: tableMargin.right },
              tableWidth: tableWidth,
              head: [["Referencia", "Concepto", "Unidades", "Precio/Unidad €", "Total €"]],
              body: bodyFormatItems,
              headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
              styles: { fontSize: 12, cellPadding: 3 },
              alternateRowStyles: { fillColor: [245, 245, 245] },
            })

            const finalY = (file as any).lastAutoTable.finalY;
            const pageHeight = file.internal.pageSize.getHeight();
            const pageWidth = file.internal.pageSize.getWidth();

            const price = Number(budget.Price) || 0;
            const iva = Number(budget.Iva) || 0;
            const irpf = Number(budget.Irpf) || 0;

            const ivaAmount = price * (iva / 100);
            const irpfAmount = price * (irpf / 100);

            let summaryHeight = 10; // TOTAL
            if (irpf > 0) summaryHeight += 10;
            if (iva > 0) summaryHeight += 10;
            if (iva > 0 || irpf > 0) summaryHeight += 10; // Subtotal

            let currentY = pageHeight - 20 - summaryHeight; // 20 bottom margin

            if (finalY > currentY) {
              file.addPage();
            }

            file.setFontSize(14);
            file.setTextColor(40);

            if (budget.Iva > 0 || budget.Irpf > 0) {
              file.text('Subtotal:', pageWidth - 60, currentY, { align: 'right' });
              file.text(String(budget.Price || '') + ' €', pageWidth - 20, currentY, { align: 'right' });
              currentY += 10;
            }

            budget.Iva > 0 && (file.text('IVA ' + iva + '%:', pageWidth - 60, currentY, { align: 'right' }), file.text(String(Number(ivaAmount).toFixed(2)) + ' €', pageWidth - 20, currentY, { align: 'right' }), currentY += 10);
            budget.Irpf > 0 && (file.text('IRPF ' + irpf + '%:', pageWidth - 60, currentY, { align: 'right' }), file.text(String(Number(irpfAmount).toFixed(2)) + ' €', pageWidth - 20, currentY, { align: 'right' }), currentY += 10);

            file.setFont('courier', 'bold');
            file.setFontSize(16);
            file.text('TOTAL:', pageWidth - 60, currentY, { align: 'right' });
            file.text(String(budget.PriceImp || '') + ' €', pageWidth - 20, currentY, { align: 'right' });
          }

          if (action === 'email') {
            this.budgetService.sendEmail(user, client, budget, file.output('datauristring')).subscribe(() => {
              const dialogRef = this.dialog.open(InfoModalComponent);
              dialogRef.componentInstance.message = Messages.EMAIL_OK;
            });
          } else {
            file.save(title + '-' + budget.Name.split('-').pop() + ".pdf");
            spinnerRef.close();
          }
        });
      });
    })
  }

  generatePurchaseReportPDF(reportId: any) {
    const spinnerRef = this.dialog.open(SpinnerLoadingComponent, {
      disableClose: true,
      panelClass: 'transparent-modal'
    });

    const file = new jsPDF();
    const title = 'Informe de compra';

    this.purchaseReportService.getPurchaseReportById(reportId).subscribe((report: any) => {
      this.userService.getUserById(report.IdBusiness).subscribe((user: any) => {
        this.supplierService.getSupplierById(report.IdSupplier).subscribe((supplier: any) => {
          this.itemService.getAllItems(report.IdBusiness).subscribe((allItems: any) => {
            const supplierItems = allItems.data.filter((item: any) => item.IdSupplier == report.IdSupplier);
            if (!report) {
              spinnerRef.close();
              return;
            }
            if (!user) {
              spinnerRef.close();
              return;
            }
            if (!supplier) {
              spinnerRef.close();
              return;
            }

            const logoY = 15;
            const logoX = 10;
            const logoWidth = 30;
            const logoHeight = 30;
            file.addImage('/assets/images/autill_logo.png', 'PNG', logoX, logoY, logoWidth, logoHeight);

            file.setFontSize(22);
            file.text(`${title} #${report.Id}`, file.internal.pageSize.getWidth() - 10, logoY + logoHeight / 2, { align: 'right' });

            const today = new Date();
            const fecha = `${this.formatToTwoDigits(today.getDate())}/${this.formatToTwoDigits(today.getMonth() + 1)}/${today.getFullYear()}`;
            file.setFontSize(14);
            file.setFont('helvetica', 'normal');
            file.text(fecha, file.internal.pageSize.getWidth() - 10, logoY + logoHeight / 2 + 8, { align: 'right' });
            file.setFont('helvetica', 'normal');

            const headerBottomY = logoY + logoHeight - 4;
            file.setDrawColor(200);
            file.setLineWidth(0.5);
            file.line(logoX, headerBottomY, file.internal.pageSize.getWidth() - logoX, headerBottomY);

            file.setFontSize(12);
            file.setTextColor(40);
            let leftColX = logoX;
            let firstRowY = headerBottomY + 10;
            let rowHeight = 8;

          // Empresa info
          file.setFont('helvetica', 'bold');
          file.text('Empresa:', leftColX, firstRowY);
          file.setFont('helvetica', 'normal');
            file.text(String(user.FullName || ''), leftColX + 25, firstRowY);

            file.setFont('helvetica', 'bold');
            file.text('Email:', leftColX, firstRowY + rowHeight);
            file.setFont('helvetica', 'normal');
            file.text(String(user.Email || ''), leftColX + 25, firstRowY + rowHeight);

            file.setFont('helvetica', 'bold');
            file.text('NIF:', leftColX, firstRowY + rowHeight * 2);
            file.setFont('helvetica', 'normal');
            file.text(String(user.Nif || ''), leftColX + 25, firstRowY + rowHeight * 2);

            file.setFont('helvetica', 'bold');
            file.text('Dirección:', leftColX, firstRowY + rowHeight * 3);
            file.setFont('helvetica', 'normal');
            file.text(String(user.Address || ''), leftColX + 25, firstRowY + rowHeight * 3);

            file.text(String((user.Region || '') + ', ' + (user.Country || '')), leftColX + 25, firstRowY + rowHeight * 4);

            file.setFont('helvetica', 'bold');
            file.text('Teléfono:', leftColX, firstRowY + rowHeight * 5);
            file.setFont('helvetica', 'normal');
            file.text(String(user.PhoneNumber || ''), leftColX + 25, firstRowY + rowHeight * 5);

          // Proveedor info
          const labelWidth = 5;
          const rightBlockX = file.internal.pageSize.getWidth() - 80;
          file.setFont('helvetica', 'bold');
          file.text('Proveedor:', rightBlockX, firstRowY, { align: 'right' });
          file.setFont('helvetica', 'normal');
          file.text(String(supplier.data.Name || ''), rightBlockX + labelWidth, firstRowY, { align: 'left' });
          file.setFont('helvetica', 'bold');
          file.text('Email:', rightBlockX, firstRowY + rowHeight, { align: 'right' });
          file.setFont('helvetica', 'normal');
          file.text(String(supplier.data.Email || ''), rightBlockX + labelWidth, firstRowY + rowHeight, { align: 'left' });
          file.setFont('helvetica', 'bold');
          file.text('NIF:', rightBlockX, firstRowY + rowHeight * 2, { align: 'right' });
          file.setFont('helvetica', 'normal');
          file.text(String(supplier.data.Nif || ''), rightBlockX + labelWidth, firstRowY + rowHeight * 2, { align: 'left' });
          file.setFont('helvetica', 'bold');
          file.text('Dirección:', rightBlockX, firstRowY + rowHeight * 3, { align: 'right' });
          file.setFont('helvetica', 'normal');
          file.text(String(supplier.data.Address || ''), rightBlockX + labelWidth, firstRowY + rowHeight * 3, { align: 'left' });
          file.text(String((supplier.data.Region || '') + ', ' + (supplier.data.Country || '')), rightBlockX + labelWidth, firstRowY + rowHeight * 4, { align: 'left' });
          file.setFont('helvetica', 'bold');
          file.text('Teléfono:', rightBlockX, firstRowY + rowHeight * 5, { align: 'right' });
          file.setFont('helvetica', 'normal');
          file.text(String(supplier.data.PhoneNumber || ''), rightBlockX + labelWidth, firstRowY + rowHeight * 5, { align: 'left' });

            // Items table
            let tableMargin = { left: logoX, right: logoX, top: firstRowY + rowHeight * 6 + 10 };
            let tableWidth = file.internal.pageSize.getWidth() - logoX * 2;
            let bodyFormatItems = [];
            const itemsFromReport = JSON.parse(report.DescriptionItems);
            let totalIva = 0;
            let totalIrpf = 0;
            let subTotal = 0;

            for (let i = 0; i < itemsFromReport.length; i++) {
              const reportItem = itemsFromReport[i];
              const fullItem = supplierItems.find((si: any) => si.Id === reportItem.Id);

              if (fullItem) {
                const price = Number(fullItem.OrderPrice) || 0;
                const quantity = Number(reportItem.toOrder) || 0;
                const totalConcept = price * quantity;
                const iva = Number(fullItem.OrderIva) || 0;
                const irpf = Number(fullItem.OrderIrpf) || 0;

                subTotal += totalConcept;
                totalIva += totalConcept * (iva / 100);
                totalIrpf += totalConcept * (irpf / 100);

                bodyFormatItems.push([
                  fullItem.Name,
                  quantity,
                  String(price.toFixed(2)) + ' €',
                  String(totalConcept.toFixed(2)) + ' €'
                ]);
              }
            }
            autoTable(file, {
              startY: tableMargin.top,
              margin: { left: tableMargin.left, right: tableMargin.right },
              tableWidth: tableWidth,
              head: [["Producto", "Unidades a pedir", "Precio/Unidad €", "Total €"]],
              body: bodyFormatItems,
              headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
              styles: { fontSize: 12, cellPadding: 3 },
              alternateRowStyles: { fillColor: [245, 245, 245] },
            });

            const finalY = (file as any).lastAutoTable.finalY;
            const pageHeight = file.internal.pageSize.getHeight();
            const pageWidth = file.internal.pageSize.getWidth();
            const grandTotal = subTotal + totalIva - totalIrpf;

            let summaryHeight = 10; // For TOTAL line
            if (totalIrpf > 0) {
              summaryHeight += 10;
            }
            if (totalIva > 0) {
              summaryHeight += 10;
            }
            summaryHeight += 10; // For Subtotal line

            let currentY = pageHeight - 20 - summaryHeight; // 20 is bottom margin

            if (finalY > currentY) {
              file.addPage();
            }

            file.setFontSize(14);
            file.setTextColor(40);
            file.text('Subtotal:', pageWidth - 60, currentY, { align: 'right' });
            file.text(String(subTotal.toFixed(2)) + ' €', pageWidth - 20, currentY, { align: 'right' });
            currentY += 10;
            totalIva > 0 && (file.text('IVA:', pageWidth - 60, currentY, { align: 'right' }), file.text(String(totalIva.toFixed(2)) + ' €', pageWidth - 20, currentY, { align: 'right' }), currentY += 10);
            totalIrpf > 0 && (file.text('IRPF:', pageWidth - 60, currentY, { align: 'right' }), file.text(String(totalIrpf.toFixed(2)) + ' €', pageWidth - 20, currentY, { align: 'right' }), currentY += 10);

            file.setFont('courier', 'bold');
            file.setFontSize(16);
            file.text('TOTAL:', pageWidth - 60, currentY, { align: 'right' });
            file.text(String(grandTotal.toFixed(2)) + ' €', pageWidth - 20, currentY, { align: 'right' });

            file.save(`${title}-${report.Id}.pdf`);
            spinnerRef.close();
          });
        });
      });
    });
  }

  formatToTwoDigits(number: number) {
    return number < 10 ? `0${number}` : `${number}`;
  }

  transformDate(date: any): string {
    const dia = this.formatToTwoDigits(date._i.date);
    const mes = this.formatToTwoDigits(date._i.month + 1);

    return dia + "/" + mes + "/" + date._i.year;
  }
}
