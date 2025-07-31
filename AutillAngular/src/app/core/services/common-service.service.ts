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
  spinner = inject(SpinnerLoadingComponent);

    loading: boolean = false;

  constructor(private dialog: MatDialog) { }

  generatePDF(action: string, type: string, id: number) {
    const file = new jsPDF();
    const title = type === 'bill' ? 'Factura' : 'Presupuesto';

    this.loading = true;
    this.budgetService.getBudgetById(id).subscribe((budget: any) => {
      this.userService.getUserById(budget.IdBusiness).subscribe((user: any) => {
        this.clientService.getClientById(budget.ClientId).subscribe((client: any) => {

          file.addImage(user.Logo, 'PNG', 10, 10, 30, 30);

          file.setFontSize(22);
          file.text(title, file.internal.pageSize.getWidth() - 20, 20, { align: 'right' });

          file.setDrawColor(200);
          file.setLineWidth(0.5);
          file.line(10, 35, file.internal.pageSize.getWidth() - 10, 35);

          file.setFontSize(14);
          file.setTextColor(40);
          file.text('Empresa:', 10, 45);
          file.text(String(user.FullName || ''), 35, 45);
          file.text('Email:', 10, 53);
          file.text(String(user.Email || ''), 35, 53);
          file.text('NIF:', 10, 61);
          file.text(String(user.Nif || ''), 35, 61);
          file.text('Dirección:', 10, 69);
          file.text(String(user.Address || ''), 35, 69);
          file.text('Región/Pais:', 10, 77);
          file.text(String((user.Region || '') + ' ' + (user.Country || '')), 35, 77);
          file.text('Teléfono:', 10, 85);
          file.text(String(user.PhoneNumber || ''), 35, 85);
          file.text('Cliente:', 120, 45);
          file.text(String(client.Name || ''), 150, 45);
          file.text('Email:', 120, 53);
          file.text(String(client.Email || ''), 150, 53);
          file.text('NIF:', 120, 61);
          file.text(String(client.Nif || ''), 150, 61);
          file.text('Dirección:', 120, 69);
          file.text(String(client.Address || ''), 150, 69);

          this.budgetService.getBudgetById(id).subscribe((budget: any) => {
            file.text(String((client.Region || '') + ' ' + (client.Country || '')), 150, 77);
            file.text('Teléfono:', 120, 85);
            file.text(String(client.PhoneNumber || ''), 150, 85);

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
              margin: { top: 100 },
              head: [["Concepto", "Unidades", "Precio/Unidad (€)", "Total (€)"]],
              body: bodyFormatItems,
              headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
              styles: { fontSize: 12, cellPadding: 3 },
              alternateRowStyles: { fillColor: [245, 245, 245] },
            })
            // Subtotal, IVA y Total con € y alineados a la derecha
            file.setFontSize(14);
            file.setTextColor(40);
            file.text('Subtotal:', file.internal.pageSize.getWidth() - 60, 260, { align: 'right' });
            file.text(String(budget.Price || '') + ' €', file.internal.pageSize.getWidth() - 20, 260, { align: 'right' });
            file.text('IVA 21%:', file.internal.pageSize.getWidth() - 60, 270, { align: 'right' });
            file.text(String(Number((budget.Price ? budget.Price * 0.21 : 0).toFixed(2))) + ' €', file.internal.pageSize.getWidth() - 20, 270, { align: 'right' });
            file.setFont('courier', 'bold');
            file.setFontSize(16);
            file.text('TOTAL:', file.internal.pageSize.getWidth() - 60, 290, { align: 'right' });
            file.text(String(Number((budget.Price ? budget.Price * 1.21 : 0).toFixed(2))) + ' €', file.internal.pageSize.getWidth() - 20, 290, { align: 'right' });
            if (action === 'email') {
              this.budgetService.sendEmail(user, client, budget, file.output('datauristring')).subscribe(() => {
                const dialogRef = this.dialog.open(InfoModalComponent);
                dialogRef.componentInstance.message = Messages.EMAIL_OK;
              });
            } else {
              file.save(title + '-' + budget.Name.split('-').pop() + ".pdf");
              this.loading = false;
            }
          });
        });
      });
    }


    )
  }

  transformDate(date: any): string {
    return date._i.date + "/" + (date._i.month + 1) + "/" + date._i.year;
  }
}
