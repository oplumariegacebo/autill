import { inject, Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { ApiService } from './api.service';
import autoTable from 'jspdf-autotable'
import { BudgetService } from './budget.service';
import { ClientService } from './client.service';
import { UserService } from './user.service';
import { InfoModalComponent } from '../../shared/components/info-modal/info-modal.component';
import { MatDialog } from '@angular/material/dialog';

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

  constructor(private dialog: MatDialog,) { }

  generatePDF(action: string, type: string, id: number) {
    const file = new jsPDF();
    let title = '';
    if (type === 'bill') {
      title = 'Factura'
    } else {
      title = 'Presupuesto'
    }

    this.budgetService.getBudgetById(id).subscribe((budget: any) => {
      this.userService.getUserById(budget.IdBusiness).subscribe((user: any) => {
        this.clientService.getClientById(budget.ClientId).subscribe((client: any) => {
            this.getBase64ImageFromUrl(user.Logo)
            .then((base64Logo: any) => {
              file.addImage(base64Logo, 'PNG', 0, 0, 30, 30);
              file.setFontSize(14);
              file.text(String(user.FullName || ''), 10, 40);
              file.text(String(user.Email || ''), 10, 50);
              file.text(String(user.Nif || ''), 10, 60);
              file.text(String(user.Address || ''), 10, 70);
              file.text(String((user.Region || '') + ' ' + (user.Country || '')), 10, 80);
              file.text(String(user.PhoneNumber || ''), 10, 90);
              file.text(String(client.Name || ''), 120, 40);
              file.text(String(client.Email || ''), 120, 50);
              file.text(String(client.Nif || ''), 120, 60);
              file.text(String(client.Address || ''), 120, 70);
              file.text(String((client.Region || '') + ' ' + (client.Country || '')), 120, 80);
              file.text(String(client.PhoneNumber || ''), 120, 90);
              let bodyFormatItems = [];
              const items = JSON.parse(budget.DescriptionItems);
              for (let i = 0; i < items.length; i++) {
                bodyFormatItems.push([items[i].Name, items[i].Units, items[i].Price, items[i].TotalConcept]);
              }
              autoTable(file, {
                margin: { top: 100 },
                head: [["Concepto", "Unidades", "Precio/Unidad", "Total"]],
                body: bodyFormatItems,
              })
              file.text("Subtotal   " + String(budget.Price || ''), 150, 260);
              file.text("IVA 21%   " + String(Number((budget.Price ? budget.Price * 0.21 : 0).toFixed(2))) + "€", 150, 270);
              file.setFont('courier', 'bold');
              file.text("TOTAL   " + String(Number((budget.Price ? budget.Price * 1.21 : 0).toFixed(2))) + "€", 150, 290);
              if (action === 'email') {
                this.budgetService.sendEmail(user, client, budget, file.output('datauristring')).subscribe(() => {
                  const dialogRef = this.dialog.open(InfoModalComponent);
                  dialogRef.componentInstance.message = Messages.EMAIL_OK;
                });
              } else {
                file.save(title + '-' + budget.Name.split('-').pop() + ".pdf");
              }
            });

          file.setFontSize(14);

          file.text(String(user.FullName || ''), 10, 40);
          file.text(String(user.Email || ''), 10, 50);
          file.text(String(user.Nif || ''), 10, 60);
          file.text(String(user.Address || ''), 10, 70);
          file.text(String((user.Region || '') + ' ' + (user.Country || '')), 10, 80);
          file.text(String(user.PhoneNumber || ''), 10, 90);

          file.text(String(client.Name || ''), 120, 40);
          file.text(String(client.Email || ''), 120, 50);
          file.text(String(client.Nif || ''), 120, 60);
          file.text(String(client.Address || ''), 120, 70);
          file.text(String((client.Region || '') + ' ' + (client.Country || '')), 120, 80);
          file.text(String(client.PhoneNumber || ''), 120, 90);

          let bodyFormatItems = [];

          const items = JSON.parse(budget.DescriptionItems);
          for (let i = 0; i < items.length; i++) {
            bodyFormatItems.push([items[i].Name, items[i].Units, items[i].Price, items[i].TotalConcept]);
          }

          autoTable(file, {
            margin: { top: 100 },
            head: [["Concepto", "Unidades", "Precio/Unidad", "Total"]],
            body: bodyFormatItems,
          })

          file.text("Subtotal   " + String(budget.Price || ''), 150, 260);
          file.text("IVA 21%   " + String(Number((budget.Price ? budget.Price * 0.21 : 0).toFixed(2))) + "€", 150, 270);

          file.setFont('courier', 'bold');
          file.text("TOTAL   " + String(Number((budget.Price ? budget.Price * 1.21 : 0).toFixed(2))) + "€", 150, 290);

          if (action === 'email') {
            this.budgetService.sendEmail(user, client, budget, file.output('datauristring')).subscribe(() => {
              const dialogRef = this.dialog.open(InfoModalComponent);
              dialogRef.componentInstance.message = Messages.EMAIL_OK;
            });
          } else {
            file.save(title + '-' + budget.Name.split('-').pop() + ".pdf");
          }
        })
      });
    })
  }

  transformDate(date: any) {
    return date._i.date + "/" + (date._i.month + 1) + "/" + date._i.year;
  }

  getBase64ImageFromUrl(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = function () {
        reject(new Error('No se pudo cargar la imagen'));
      };
      img.src = imageUrl;
    });
  }
}
