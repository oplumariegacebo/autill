import { Routes } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { UserInfoComponent } from './core/components/user-info/user-info.component';
import { BillsComponent } from './core/components/bills/bills.component';
import { BudgetsComponent } from './core/components/budgets/budgets.component';
import { ClientsComponent } from './core/components/clients/clients.component';
import { ItemsComponent } from './core/components/items/items.component';
import { DashboardComponent } from './core/components/dashboard/dashboard.component';
import { SuppliersComponent } from './core/components/suppliers/suppliers.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'userInfo', component: UserInfoComponent},
    { path: 'bills', component: BillsComponent},
    { path: 'budgets', component: BudgetsComponent },
    { path: 'clients', component: ClientsComponent},
    { path: 'items', component: ItemsComponent},
    { path: 'suppliers', component: SuppliersComponent}
];