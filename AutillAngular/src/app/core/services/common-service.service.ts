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
  "SEND_EMAIL": "¿Desea enviar el presupuesto en formato PDF al email: "
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  apiService = inject(ApiService);
  budgetService = inject(BudgetService);
  clientService = inject(ClientService);
  userService = inject(UserService);

  constructor(private dialog: MatDialog) { }

  generatePDF(action: string, type: string, id: number) {
    const spinnerRef = this.dialog.open(SpinnerLoadingComponent, {
      disableClose: true,
      panelClass: 'transparent-modal'
    });

    const file = new jsPDF();
    const title = type === 'bill' ? 'Factura' : 'Presupuesto';

    this.budgetService.getBudgetById(id).subscribe((budget: any) => {
      this.userService.getUserById(budget.IdBusiness).subscribe((user: any) => {
        this.clientService.getClientById(budget.ClientId).subscribe((client: any) => {

          const logoY = 15;
          const logoX = 10;
          const logoWidth = 30;
          const logoHeight = 30;
          file.addImage('/assets/images/autill_logo.png', 'PNG', logoX, logoY, logoWidth, logoHeight);

          file.setFontSize(22);

          file.text(budget.Name, file.internal.pageSize.getWidth() - 10, logoY + logoHeight / 2 + 5, { align: 'right' });

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
          for (let i = 0; i < items.length; i++) {
            bodyFormatItems.push([
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
            head: [["Concepto", "Unidades", "Precio/Unidad €", "Total €"]],
            body: bodyFormatItems,
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 12, cellPadding: 3 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
          })

          const price = Number(budget.Price) || 0;
          const iva = Number(budget.Iva) || 0;
          const irpf = Number(budget.Irpf) || 0;

          const ivaAmount = price * (iva / 100);
          const irpfAmount = price * (irpf / 100);

          file.setFontSize(14);
          file.setTextColor(40);
          file.text('Subtotal:', file.internal.pageSize.getWidth() - 60, 260, { align: 'right' });
          file.text(String(budget.Price || '') + ' €', file.internal.pageSize.getWidth() - 20, 260, { align: 'right' });
          file.text('IVA ' + iva + '%:', file.internal.pageSize.getWidth() - 60, 270, { align: 'right' });
          file.text(String(Number(ivaAmount).toFixed(2)) + ' €', file.internal.pageSize.getWidth() - 20, 270, { align: 'right' });
          file.text('IRPF ' + irpf + '%:', file.internal.pageSize.getWidth() - 60, 270, { align: 'right' });
          file.text(String(Number(irpfAmount).toFixed(2)) + ' €', file.internal.pageSize.getWidth() - 20, 270, { align: 'right' });
          file.setFont('courier', 'bold');
          file.setFontSize(16);
          file.text('TOTAL:', file.internal.pageSize.getWidth() - 60, 290, { align: 'right' });
          file.text(String(budget.PriceImp.toFixed(2)) + ' €', file.internal.pageSize.getWidth() - 20, 290, { align: 'right' });
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
    }


    )
  }

  transformDate(date: any): string {
    return date._i.date + "/" + (date._i.month + 1) + "/" + date._i.year;
  }
}
