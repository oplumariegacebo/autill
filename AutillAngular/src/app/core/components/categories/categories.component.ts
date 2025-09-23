import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteItemModalComponent } from '../../../shared/components/delete-item-modal/delete-item-modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ItemModalComponent } from '../../../shared/components/item-modal/item-modal.component';
import { ErrorsComponent } from '../../../shared/components/errors/errors.component';
import { CategoryService } from '../../services/category.service';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { SearchFiltersComponent } from '../../../shared/components/search-filters/search-filters.component';
import { CommonService, Messages } from '../../services/common-service.service';
import { CategoryModalComponent } from '../../../shared/components/category-modal/category-modal.component';
import { SpinnerLoadingComponent } from '../../../shared/components/spinner-loading/spinner-loading.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ErrorsComponent, PaginatorComponent, SearchFiltersComponent, SpinnerLoadingComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {
  @Input() categories: any;

  dataScreen: string = 'categories'
  dataCategories: any = [];
  showModal = false;
  showFilters = false;
  categoriesService = inject(CategoryService);
  commonService = inject(CommonService);
  errorMessage: string = '';
  allCategories: any = [];
  filtersActivated: any = null;
  loading: boolean = false;

  displayedColumns: string[] = ['name', 'price', 'actions'];

  constructor(private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.categoriesService.getCategories(localStorage.getItem('id') || "[]", null, 10, 0).subscribe({
      next: (data: any) => {
        this.allCategories = data;
        this.dataCategories = data;
        this.categories = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        let error = '';
        if (err.status === 500) {
          error = 'Internal server error.'
        } else {
          error = 'Ha ocurrido un error, contacta con el administrador.'
        }
        this.errorMessage = error;
        this.loading = false;
      }
    })
  }

  openTaskDialog(action: string, category: any) {
    if(action === 'view'){
      this.router.navigate(['/items'], { queryParams: { categoryId: category.Id } });
    }else{
    const dialogRef = this.dialog.open(CategoryModalComponent);
    dialogRef.componentInstance.category = category;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do something
      }
    });
    }
  }

  updateCategories(pagination: any) {
    this.categoriesService.getCategories(localStorage.getItem('id') || "[]", null, 10, pagination.skip).subscribe((Categories: any) => {
      this.allCategories = Categories;
      this.dataCategories = Categories;
      this.categories = Categories;
    })
  }

  updateSearching(formControlValue: any) {
    if (formControlValue === "") {
      this.filtersActivated = null;
      this.categoriesService.getCategories(localStorage.getItem('id') || "[]", null, 10, 0).subscribe((Categories: any) => {
        this.allCategories = Categories;
        this.dataCategories = Categories;
        this.categories = Categories;
      })
    } else {
      this.filtersActivated = formControlValue;
      this.categoriesService.getCategories(localStorage.getItem('id') || "[]", formControlValue, 10, 0).subscribe((filterCategories: any) => {
        this.categories = filterCategories;
        this.allCategories = this.categories;
      });
    }
  }

  deleteCategory(id: number) {
    const dialogRef = this.dialog.open(DeleteItemModalComponent);
    dialogRef.componentInstance.type = 'categoría';
    dialogRef.componentInstance.title = '¿Desea eliminar la categoría?';
    dialogRef.componentInstance.message = 'Si elimina la categoría, se eliminarán los productos/servicios asociados.';
    dialogRef.componentInstance.id = id;

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.categoriesService.deleteCategory(id).subscribe({
          next: () => {
            window.location.reload();
          }
        });
      }
    });
  }
}